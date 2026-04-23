const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("search");
const statusMessage = document.getElementById("statusMessage");
const profileContainer = document.getElementById("profile");
const reposContainer = document.getElementById("repos");

searchForm.addEventListener("submit", handleSearch);

async function handleSearch(event) {
  event.preventDefault();

  const username = searchInput.value.trim();

  if (!username) {
    clearResults();
    setStatus("Please enter a GitHub username to begin.", "error");
    searchInput.focus();
    return;
  }

  setStatus(`Searching for ${username}...`, "loading");
  profileContainer.innerHTML = "";
  reposContainer.innerHTML = "";

  try {
    const user = await fetchJson(`https://api.github.com/users/${encodeURIComponent(username)}`);
    renderProfile(user);

    const repos = await fetchJson(user.repos_url);
    renderRepositories(repos);
    setStatus(`Profile loaded for @${user.login}.`, "success");
  } catch (error) {
    clearResults();

    if (error.message === "NOT_FOUND") {
      setStatus("User Not Found. Try another GitHub username.", "error");
      return;
    }

    setStatus("Something went wrong while fetching data. Please try again.", "error");
  }
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error("REQUEST_FAILED");
  }

  return response.json();
}

function renderProfile(user) {
  const displayName = user.name || user.login;
  const bio = user.bio || "No bio available yet.";
  const joinedDate = formatDate(user.created_at);
  const blogLink = normalizeUrl(user.blog);
  const portfolioMarkup = blogLink
    ? `<a class="profile-link" href="${escapeHtml(blogLink)}" target="_blank" rel="noreferrer">Visit Portfolio</a>`
    : "";

  profileContainer.innerHTML = `
    <article class="profile-card">
      <div class="avatar-wrap">
        <img class="avatar" src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(displayName)} avatar">
      </div>
      <div class="profile-content">
        <div class="profile-heading">
          <div>
            <h2 class="profile-name">${escapeHtml(displayName)}</h2>
            <p class="profile-handle">@${escapeHtml(user.login)}</p>
          </div>
        </div>
        <p class="profile-bio">${escapeHtml(bio)}</p>
        <div class="profile-meta">
          <span class="meta-pill">Joined ${joinedDate}</span>
          <span class="meta-pill">${user.public_repos} public repos</span>
        </div>
        ${portfolioMarkup}
      </div>
    </article>
  `;
}

function renderRepositories(repositories) {
  const latestRepositories = [...repositories]
    .sort((firstRepo, secondRepo) => new Date(secondRepo.updated_at) - new Date(firstRepo.updated_at))
    .slice(0, 5);

  if (!latestRepositories.length) {
    reposContainer.innerHTML = `
      <div class="empty-card">
        No public repositories found for this user.
      </div>
    `;
    return;
  }

  const repoItems = latestRepositories
    .map((repo) => {
      const description = repo.description || "No description provided.";

      return `
        <a class="repo-link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">
          <div class="repo-topline">
            <span class="repo-name">${escapeHtml(repo.name)}</span>
            <span class="repo-updated">Updated ${formatDate(repo.updated_at)}</span>
          </div>
          <p class="repo-description">${escapeHtml(description)}</p>
        </a>
      `;
    })
    .join("");

  reposContainer.innerHTML = `
    <section class="repo-panel">
      <div class="repo-header">
        <h2>Latest Repositories</h2>
        <span class="repo-count">Showing ${latestRepositories.length} of ${repositories.length}</span>
      </div>
      <div class="repo-list">${repoItems}</div>
    </section>
  `;
}

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type) {
    statusMessage.classList.add(`is-${type}`);
  }
}

function clearResults() {
  profileContainer.innerHTML = "";
  reposContainer.innerHTML = "";
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function normalizeUrl(url) {
  if (!url) {
    return "";
  }

  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
