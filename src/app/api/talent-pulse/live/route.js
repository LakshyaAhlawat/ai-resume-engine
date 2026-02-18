import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { githubUser, leetcodeUser } = await req.json();

    if (!githubUser && !leetcodeUser) {
      return NextResponse.json({ error: "Missing identity handles" }, { status: 400 });
    }

    let githubData = null;
    let leetcodeData = null;

    // 1. Fetch GitHub Data
    if (githubUser) {
      try {
        const ghRes = await fetch(`https://api.github.com/users/${githubUser}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            // Add a GitHub token if available in env to avoid rate limits
            ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
          }
        });
        if (ghRes.ok) {
          const ghJson = await ghRes.json();
          githubData = {
            name: ghJson.name || ghJson.login,
            avatar: ghJson.avatar_url,
            repos: ghJson.public_repos,
            followers: ghJson.followers,
            stars: 0, // Would require repo enumeration for accurate count
            bio: ghJson.bio,
            blog: ghJson.blog,
            location: ghJson.location,
            created_at: ghJson.created_at
          };
        }
      } catch (err) {
        console.error("GitHub fetch error:", err);
      }
    }

    // 2. Fetch LeetCode Data (via GraphQL)
    if (leetcodeUser) {
      try {
        const query = `
          query userContestRankingInfo($username: String!) {
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
              globalRanking
              totalParticipants
              topPercentage
            }
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `;

        const lcRes = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { username: leetcodeUser } })
        });

        if (lcRes.ok) {
          const lcJson = await lcRes.json();
          const ranking = lcJson.data?.userContestRanking;
          const stats = lcJson.data?.matchedUser?.submitStats?.acSubmissionNum;

          leetcodeData = {
            rating: Math.round(ranking?.rating || 0),
            globalRank: ranking?.globalRanking || 0,
            topPercentage: ranking?.topPercentage || 0,
            totalSolved: stats?.find(s => s.difficulty === "All")?.count || 0,
            easySolved: stats?.find(s => s.difficulty === "Easy")?.count || 0,
            mediumSolved: stats?.find(s => s.difficulty === "Medium")?.count || 0,
            hardSolved: stats?.find(s => s.difficulty === "Hard")?.count || 0
          };
        }
      } catch (err) {
        console.error("LeetCode fetch error:", err);
      }
    }

    // 3. Calculate Astra Power Score (Weighted Algorithm)
    // 50% LeetCode Rating (Max 3000)
    // 30% GitHub Activity (Max 100 followers/repos)
    // 20% Problem Density (Max 500 solved)
    
    const lcWeight = leetcodeData ? (Math.min(leetcodeData.rating, 2800) / 2800) * 50 : 0;
    const ghWeight = githubData ? (Math.min((githubData.followers + githubData.repos), 200) / 200) * 30 : 0;
    const solveWeight = leetcodeData ? (Math.min(leetcodeData.totalSolved, 1000) / 1000) * 20 : 0;
    
    const powerScore = Math.round(lcWeight + ghWeight + solveWeight);

    return NextResponse.json({
      success: true,
      identity: {
        github: githubData,
        leetcode: leetcodeData
      },
      powerScore,
      tier: powerScore > 85 ? "S-Tier" : powerScore > 70 ? "A-Tier" : powerScore > 50 ? "B-Tier" : "C-Tier",
      analysis: `Astra analysis indicates a ${powerScore > 70 ? 'High-Impact' : 'Growth-Stage'} engineering archetype specializing in ${githubData?.bio?.split(' ')[0] || 'Technical Systems'}.`
    });

  } catch (error) {
    console.error("Talent Pulse Route Error:", error);
    return NextResponse.json({ error: "External API sync failed" }, { status: 500 });
  }
}
