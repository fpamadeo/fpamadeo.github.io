#!/usr/bin/env python3
"""Sync .txt writing drafts from content/ to src/data/writing.json.

Place .txt files in the content/ directory (next to this executable).
Run this to parse metadata, resolve conflicts, and merge entries into
the writing.json data file used by the portfolio app.
"""

import sys
import os
import json
from datetime import datetime, timezone
from pathlib import Path


# ─── Paths ──────────────────────────────────────────────────────────

def get_base_dir():
    """Return the directory that contains this script / executable."""
    if getattr(sys, 'frozen', False):
        return Path(sys.executable).parent
    return Path(__file__).resolve().parent

BASE_DIR    = get_base_dir()
CONTENT_DIR = BASE_DIR / 'content'
LOGS_DIR    = CONTENT_DIR / 'logs'
OUTPUT_PATH = BASE_DIR.parent / 'data' / 'writing.json'


# ─── File helpers ───────────────────────────────────────────────────

def is_empty_file(path):
    try:
        return path.read_text(encoding='utf-8').strip() == ''
    except (OSError, UnicodeDecodeError):
        return True


def parse_txt(path):
    """Return (uid, title, tags, related, content).

    Lines starting with \\ are metadata.  The first line that does *not*
    start with \\ marks the beginning of the content body.  No title →
    use filename stem.  No uid → return None so the caller generates one.

    \\tags: and \\related: are semicolon-separated lists.
    If absent they return None (preserve existing on update).
    """
    lines = path.read_text(encoding='utf-8').splitlines(keepends=True)

    uid = None
    title = None
    tags = None
    related = None
    content_start = 0

    for i, line in enumerate(lines):
        s = line.rstrip('\n\r')
        if not s.startswith('\\'):
            content_start = i
            break
        meta = s[1:]
        if meta.startswith('UID:'):
            val = meta[4:].strip()
            uid = val if val else None
        elif meta.startswith('Title:'):
            val = meta[6:].strip()
            title = val if val else None
        elif meta.startswith('tags:'):
            val = meta[5:].strip()
            tags = [t.strip() for t in val.split(';') if t.strip()] if val else []
        elif meta.startswith('related:'):
            val = meta[8:].strip()
            raw = [r.strip() for r in val.split(';') if r.strip()] if val else []
            related = []
            for r in raw:
                try:
                    related.append(int(r))
                except ValueError:
                    related.append(r)
    else:
        content_start = len(lines)

    content = ''.join(lines[content_start:]).strip()
    if title is None:
        title = path.stem
    return uid, title, tags, related, content


def ensure_uid(path, uid):
    """Prepend \\UID: <uid> to *path* if no \\UID: line exists yet."""
    content = path.read_text(encoding='utf-8')
    lines = content.splitlines(keepends=True)
    if any(l.rstrip('\n\r').startswith('\\UID:') for l in lines):
        return
    path.write_text(f'\\UID: {uid}\n{content}', encoding='utf-8')


def file_mtime_iso(path):
    ts = path.stat().st_mtime
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def parse_iso(s):
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def file_newer_than(path, date_str):
    """True if *path* was modified after the given ISO date string."""
    try:
        return path.stat().st_mtime > parse_iso(date_str).timestamp()
    except (ValueError, TypeError, OSError):
        return True


# ─── Data helpers ───────────────────────────────────────────────────

def read_writing_json():
    """Return (entries_by_uid_dict, entries_list)."""
    if not OUTPUT_PATH.exists():
        return {}, []
    with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    by_uid = {}
    for entry in data:
        uid = str(entry.get('UID', ''))
        by_uid[uid] = entry
    return by_uid, data


def write_writing_json(entries):
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
        f.write('\n')


def write_log(text):
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d-%H%M%S')
    p = LOGS_DIR / f'sync-{ts}.txt'
    p.write_text(text, encoding='utf-8')
    return p


# ─── UID generation ────────────────────────────────────────────────

def generate_uid(used_uids):
    """Smallest positive integer not in *used_uids*."""
    n = 1
    while n in used_uids:
        n += 1
    return n


# ─── Duplicate resolution ──────────────────────────────────────────

def resolve_duplicate_group(uid, files, postpone_ok=True):
    """Interactively pick what to do with a duplicate UID.

    *files* is a list of (filepath, filename, entries_index).

    Returns (action, chosen_index) where action ∈
      {'ignore', 'new_uids', 'skip_all', 'postpone'}.
    """
    print(f'\nDuplicate UID "{uid}" found in:')
    for i, (_, name, _) in enumerate(files, 1):
        print(f'  [{i}] {name}')

    prompt = (
        'Action: (I)gnore extras, '
        '(N)ew UIDs for extras, '
        '(C)hoose which to keep, '
        '(S)kip all'
    )
    if postpone_ok:
        prompt += ', (P)ostpone'

    while True:
        choice = input(f'{prompt} [I]: ').strip().lower() or 'i'
        if choice == 'i':
            return 'ignore', 0
        if choice == 'n':
            return 'new_uids', 0
        if choice == 'c':
            while True:
                pick = input(
                    f'Which file keeps UID "{uid}"? '
                    f'(1-{len(files)}, or 0 to skip all): '
                ).strip()
                if pick.isdigit():
                    n = int(pick)
                    if n == 0:
                        return 'skip_all', None
                    if 1 <= n <= len(files):
                        return 'ignore', n - 1
                print(f'  Please enter 0-{len(files)}.')
        if choice == 's':
            return 'skip_all', None
        if choice == 'p' and postpone_ok:
            return 'postpone', None
        print('  Invalid choice.')


def apply_decision(action, chosen, uid, flist, entries, used_uids, summary):
    """Apply a duplicate-resolution decision, mutating *entries* in-place."""
    if action == 'skip_all':
        for _, name, idx in flist:
            entries[idx]['sync'] = False
            summary.append(f'SKIPPED (duplicate): {name} (UID: {uid})')
        return

    for i, (fp, name, idx) in enumerate(flist):
        if i == chosen:
            continue
        if action == 'new_uids':
            new_uid = generate_uid(used_uids)
            used_uids.add(new_uid)
            ensure_uid(fp, new_uid)
            entries[idx]['uid'] = str(new_uid)
            summary.append(f'NEW UID: {name} -> {new_uid} (was {uid})')
        else:
            entries[idx]['sync'] = False
            summary.append(f'SKIPPED (duplicate): {name} (UID: {uid})')


# ─── Main ───────────────────────────────────────────────────────────

def main():
    print('=== Writing Sync Tool ===\n')
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)

    # ── Phase 1: Scan ──────────────────────────────────────────────

    txt_files = sorted(CONTENT_DIR.glob('*.txt'))
    if not txt_files:
        print('No .txt files found in content/.')
        input('\nPress Enter to exit...')
        return

    summary = []
    entries = []  # list of dicts: fp, uid, title, content, sync, empty

    for fp in txt_files:
        if is_empty_file(fp):
            entries.append({
                'fp': fp, 'uid': None, 'title': fp.stem,
                'content': '', 'sync': False, 'empty': True,
            })
            continue
        uid, title, tags, related, content = parse_txt(fp)
        entries.append({
            'fp': fp, 'uid': uid, 'title': title,
            'tags': tags, 'related': related,
            'content': content, 'sync': True, 'empty': False,
        })

    empty_files = [e for e in entries if e['empty']]
    for e in empty_files:
        summary.append(f'SKIPPED (empty): {e["fp"].name}')
    if empty_files:
        print(f'Empty files skipped: {len(empty_files)}\n')

    # ── Phase 2: Assign UIDs to files that lack one ────────────────

    _, existing_raw = read_writing_json()
    used_uids = set()
    for entry in existing_raw:
        try:
            used_uids.add(int(entry['UID']))
        except (ValueError, KeyError, TypeError):
            pass
    for e in entries:
        if e['uid'] is not None:
            try:
                used_uids.add(int(e['uid']))
            except (ValueError, TypeError):
                pass

    for e in entries:
        if e['uid'] is None and not e['empty']:
            new_uid = generate_uid(used_uids)
            used_uids.add(new_uid)
            ensure_uid(e['fp'], new_uid)
            e['uid'] = str(new_uid)
            summary.append(f'GENERATED UID: {e["fp"].name} -> {new_uid}')

    # ── Phase 3: Resolve duplicates ────────────────────────────────

    uid_idx_map = {}
    for idx, e in enumerate(entries):
        if e['sync'] and e['uid'] is not None:
            uid_idx_map.setdefault(e['uid'], []).append(
                (e['fp'], e['fp'].name, idx)
            )

    dupe_groups = [(u, flist) for u, flist in uid_idx_map.items() if len(flist) > 1]

    if dupe_groups:
        print('--- Resolving duplicate UIDs ---')

    postponed = []
    for uid, flist in dupe_groups:
        action, chosen = resolve_duplicate_group(uid, flist, postpone_ok=True)
        if action == 'postpone':
            postponed.append((uid, flist))
            continue
        apply_decision(action, chosen, uid, flist, entries, used_uids, summary)

    if postponed:
        print('\n--- Resolving postponed duplicates ---')
        for uid, flist in postponed:
            action, chosen = resolve_duplicate_group(uid, flist, postpone_ok=False)
            apply_decision(action, chosen, uid, flist, entries, used_uids, summary)

    # ── Phase 4: Sync ──────────────────────────────────────────────

    print('\nSyncing with writing.json...')
    entries_by_uid, existing_list = read_writing_json()
    added = []
    updated = []
    skipped_older = []

    # Rebuild map after potential external changes
    entries_by_uid = {}
    for entry in existing_list:
        entries_by_uid[str(entry.get('UID', ''))] = entry

    for e in entries:
        if not e['sync']:
            continue
        fp = e['fp']
        uid = e['uid']
        date_iso = file_mtime_iso(fp)

        if uid in entries_by_uid:
            existing = entries_by_uid[uid]
            if file_newer_than(fp, existing.get('Date', '')):
                existing['Title'] = e['title']
                existing['Content'] = e['content']
                existing['Date'] = date_iso
                if e['tags'] is not None:
                    existing['tags'] = e['tags']
                if e['related'] is not None:
                    existing['related'] = e['related']
                updated.append(fp.name)
                summary.append(f'UPDATED: {fp.name} (UID: {uid})')
            else:
                skipped_older.append(fp.name)
                summary.append(f'SKIPPED (not modified): {fp.name} (UID: {uid})')
        else:
            new_entry = {
                'UID': uid,
                'Title': e['title'],
                'tags': e['tags'] if e['tags'] is not None else [],
                'related': e['related'] if e['related'] is not None else [],
                'Date': date_iso,
                'Content': e['content'],
            }
            try:
                new_entry['UID'] = int(uid)
            except ValueError:
                pass
            existing_list.append(new_entry)
            entries_by_uid[uid] = new_entry
            added.append(fp.name)
            summary.append(f'ADDED: {fp.name} (UID: {uid})')

    # Normalise UID type (int if possible, else str)
    for entry in existing_list:
        uid_val = entry.get('UID')
        if isinstance(uid_val, str):
            try:
                entry['UID'] = int(uid_val)
            except ValueError:
                pass

    write_writing_json(existing_list)

    # ── Phase 5: Summary ───────────────────────────────────────────

    print('\n' + '=' * 50)
    print('  SYNC SUMMARY')
    print('=' * 50)
    for line in summary:
        print(f'  {line}')
    print('=' * 50)
    print(
        f'  Added: {len(added)}  |  Updated: {len(updated)}  |  '
        f'Skipped (not modified): {len(skipped_older)}  |  '
        f'Skipped (empty): {len(empty_files)}'
    )

    full_summary = '\n'.join(summary)

    print()
    resp = input(
        "Press Enter to exit, or type 'log' to save this summary to a log file: "
    ).strip().lower()
    if resp == 'log':
        p = write_log(full_summary)
        print(f'Summary saved to: {p}')
        input('Press Enter to exit...')


if __name__ == '__main__':
    main()
