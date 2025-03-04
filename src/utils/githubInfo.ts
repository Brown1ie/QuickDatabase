import axios from 'axios';

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
}

interface GitHubInfo {
  version: string;
  lastUpdated: string;
  error?: string;
}

export const getGitHubInfo = async (): Promise<GitHubInfo> => {
  try {
    // Fetch commits from the GitHub API
    const response = await axios.get(
      'https://api.github.com/repos/Brown1ie/QuickDatabase/commits',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const commits: GitHubCommit[] = response.data;
    
    // Calculate version based on number of commits
    const commitCount = commits.length;
    const version = `V1.${commitCount}`;
    
    // Get the date of the latest commit
    const latestCommit = commits[0];
    const lastUpdated = new Date(latestCommit.commit.author.date).toLocaleString();
    
    return {
      version,
      lastUpdated
    };
  } catch (error) {
    console.error('Error fetching GitHub info:', error);
    return {
      version: 'V1.0',
      lastUpdated: new Date().toLocaleString(),
      error: 'Could not fetch version information'
    };
  }
};