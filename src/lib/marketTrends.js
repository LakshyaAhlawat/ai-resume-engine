const CACHE_TTL_MS = 60 * 60 * 1000;
let cache = null;
let cacheTime = 0;

export async function getMarketTrends() {
  if (cache && Date.now() - cacheTime < CACHE_TTL_MS) {
    return cache;
  }

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const res = await fetch(
    `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=40`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` }),
      },
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status}`);
  }

  const data = await res.json();
  const repos = data.items || [];

  const languageMap = {};
  repos.forEach((repo) => {
    if (!repo.language) return;
    if (!languageMap[repo.language]) languageMap[repo.language] = { repos: 0, stars: 0 };
    languageMap[repo.language].repos += 1;
    languageMap[repo.language].stars += repo.stargazers_count;
  });

  const trendingLanguages = Object.entries(languageMap)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 8);

  const topRepos = repos.slice(0, 6).map((r) => ({
    name: r.full_name,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    url: r.html_url,
  }));

  const result = {
    generatedAt: new Date().toISOString(),
    windowDays: 14,
    totalReposSampled: repos.length,
    trendingLanguages,
    topRepos,
    source: 'GitHub public repository search (new repos in the last 14 days, ranked by stars)',
  };

  cache = result;
  cacheTime = Date.now();
  return result;
}
