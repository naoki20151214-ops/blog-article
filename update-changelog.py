#!/usr/bin/env python3
"""Helper script to automatically update changelog.html from commit messages."""

import sys
from datetime import datetime
from pathlib import Path
import re

def get_japanese_date():
    """Get current date in Japanese format."""
    now = datetime.now()
    return f"{now.year}年{now.month}月{now.day}日"

def get_japanese_time():
    """Get current time in HH:MM format."""
    now = datetime.now()
    return f"{now.hour:02d}:{now.minute:02d}"

def extract_summary(commit_message):
    """Extract the first line of commit message as summary."""
    lines = commit_message.strip().split('\n')
    summary = lines[0].strip()
    # Remove common prefixes like "feat:", "fix:", etc.
    summary = re.sub(r'^(feat|fix|docs|style|refactor|perf|test|chore):\s*', '', summary)
    return summary

def update_changelog(commit_message):
    """Update changelog.html with new entry from commit message."""
    changelog_path = Path(__file__).parent / 'changelog.html'

    if not changelog_path.exists():
        print(f"Error: {changelog_path} not found", file=sys.stderr)
        return False

    try:
        with open(changelog_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        summary = extract_summary(commit_message)
        if not summary:
            print("Warning: Empty commit message", file=sys.stderr)
            return True

        date_str = get_japanese_date()
        time_str = get_japanese_time()

        # Find the changelog-entries div and the date section
        entries_start = -1
        date_line = -1

        for i, line in enumerate(lines):
            if '<div class="changelog-entries">' in line:
                entries_start = i

            # Find the date section
            if f'<div class="entry-date">{date_str}</div>' in line:
                date_line = i
                break

        if entries_start == -1:
            print("Error: changelog-entries div not found", file=sys.stderr)
            return False

        # Create the new entry
        entry_lines = [
            '                <div class="entry-item">\n',
            f'                    <span class="entry-time">{time_str}</span>\n',
            f'                    <div class="entry-description">{summary}</div>\n',
            '                </div>\n',
        ]

        if date_line >= 0:
            # Insert after the date line
            insert_position = date_line + 1
        else:
            # Create new date section
            date_line_text = f'                <div class="entry-date">{date_str}</div>\n'
            lines.insert(entries_start + 1, date_line_text)
            insert_position = entries_start + 2

        # Insert the new entry
        for i, entry_line in enumerate(entry_lines):
            lines.insert(insert_position + i, entry_line)

        # Write back
        with open(changelog_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        return True

    except Exception as e:
        print(f"Error updating changelog: {e}", file=sys.stderr)
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: update-changelog.py '<commit message>'", file=sys.stderr)
        sys.exit(1)

    commit_msg = sys.argv[1]
    success = update_changelog(commit_msg)
    sys.exit(0 if success else 1)
