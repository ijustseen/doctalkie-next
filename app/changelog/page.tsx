import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Define the expected structure of a GitHub release object
interface GitHubRelease {
  id: number;
  name: string | null; // Release title
  tag_name: string; // Version tag
  body: string | null; // Release notes in Markdown
  published_at: string; // ISO 8601 date string
  html_url: string; // Link to the release page on GitHub
}

async function getGithubReleases(): Promise<GitHubRelease[]> {
  const owner = "ijustseen";
  const repo = "doctalkie-react";
  const url = `https://api.github.com/repos/${owner}/${repo}/releases`;

  // Optional: Add Authorization header if needed for rate limits or private repo
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    // Uncomment and set your token if needed
    // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const response = await fetch(url, {
      headers: headers,
      next: { revalidate: 3600 }, // Revalidate data every hour
    });

    if (!response.ok) {
      console.error(
        `GitHub API request failed: ${response.status} ${response.statusText}`
      );
      // Consider throwing an error or returning an empty array
      // depending on how you want to handle API errors
      // throw new Error(`Failed to fetch releases: ${response.statusText}`);
      return []; // Return empty array on error for now
    }

    const data: GitHubRelease[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching GitHub releases:", error);
    return []; // Return empty array on network or other errors
  }
}

export default async function ChangelogPage() {
  const releases = await getGithubReleases();

  return (
    <div className="container py-12 px-4 md:px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">
        Changelog
      </h1>

      {releases.length === 0 ? (
        <p className="text-muted-foreground">
          No releases found or failed to load changelog.
        </p>
      ) : (
        <div className="space-y-12">
          {releases.map((release) => (
            <article key={release.id} className="relative">
              {/* Optional: Add a timeline indicator */}
              {/* <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border -ml-4"></div> */}
              <div className="mb-3 flex items-center gap-x-4">
                <h2 className="text-2xl font-semibold">
                  <a
                    href={release.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {release.name || release.tag_name}
                  </a>
                </h2>
                <time
                  dateTime={release.published_at}
                  className="text-sm text-muted-foreground"
                >
                  {format(new Date(release.published_at), "MMMM d, yyyy")}
                </time>
              </div>
              {release.body ? (
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {release.body}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided for this release.
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
