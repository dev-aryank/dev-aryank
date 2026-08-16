import { readFile, writeFile } from "node:fs/promises";

const username = process.env.PROFILE_USERNAME || "dev-aryank";
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": `${username}-profile-readme`,
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function clean(value, fallback = "—") {
  const text = String(value || fallback)
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
  return text.length > 150 ? `${text.slice(0, 147)}…` : text;
}

function date(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function replaceBlock(readme, name, content) {
  const start = `<!-- AUTO:${name}:START -->`;
  const end = `<!-- AUTO:${name}:END -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(readme)) throw new Error(`Missing ${name} markers in README.md`);
  return readme.replace(pattern, `${start}\n${content}\n${end}`);
}

function projectTable(repos) {
  const projects = repos
    .filter((repo) => !repo.fork && !repo.archived && repo.name !== username)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 5);

  const rows = projects.map((repo) => {
    const description = clean(repo.description, "A project whose story is still being written.");
    return `| [${clean(repo.name)}](${repo.html_url}) | ${description} | \`${clean(repo.language, "Code")}\` | ${date(repo.pushed_at)} |`;
  });

  return [
    "| Project | What it is | Stack | Last push |",
    "|:--|:--|:--:|:--:|",
    ...rows,
  ].join("\n");
}

const eventLabels = {
  CreateEvent: (event) => `created ${event.payload.ref_type || "something new"} in`,
  DeleteEvent: (event) => `cleaned up ${event.payload.ref_type || "a ref"} in`,
  ForkEvent: () => "forked",
  IssuesEvent: (event) => `${event.payload.action || "updated"} an issue in`,
  IssueCommentEvent: () => "joined a discussion in",
  PullRequestEvent: (event) => `${event.payload.action || "updated"} a pull request in`,
  PullRequestReviewEvent: () => "reviewed code in",
  PushEvent: (event) => {
    const count = event.payload.commits?.length || 1;
    return `pushed ${count} commit${count === 1 ? "" : "s"} to`;
  },
  ReleaseEvent: (event) => `${event.payload.action || "published"} a release in`,
  WatchEvent: () => "starred",
};

function activityList(events) {
  const items = events
    .filter((event) => eventLabels[event.type])
    .slice(0, 8)
    .map((event) => {
      const action = eventLabels[event.type](event);
      const repo = event.repo.name;
      const url = `https://github.com/${repo}`;
      return `- **${date(event.created_at)}** — ${action} [${repo}](${url})`;
    });

  return items.length
    ? items.join("\n")
    : "No recent public events were returned by GitHub yet—something new is probably being built.";
}

const [repos, events, current] = await Promise.all([
  github(`/users/${username}/repos?per_page=100&sort=pushed&type=owner`),
  github(`/users/${username}/events/public?per_page=30`),
  readFile("README.md", "utf8"),
]);

let next = replaceBlock(current, "PROJECTS", projectTable(repos));
next = replaceBlock(next, "ACTIVITY", activityList(events));

if (next !== current) {
  await writeFile("README.md", next, "utf8");
  console.log("README.md refreshed from GitHub activity.");
} else {
  console.log("README.md is already current.");
}

