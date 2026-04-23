Write JavaScript for a GitHub User Search App.

Requirements:
- On Enter key, fetch user data from https://api.github.com/users/{username}
- Display avatar, name (or login), bio, join date (formatted), and blog link (if available)
- Fetch repositories using repos_url and show top 5 latest repos (sorted by created_at)
- Repo names should open in a new tab

Handle:
- Loading state while fetching
- "User Not Found" error
- Empty input

Use async/await, try/catch, and basic DOM methods.
Keep the code clean and modular (getUser, showProfile, getRepos, showRepos).
