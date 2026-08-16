# Install this profile README

The folder is ready to become the contents of `dev-aryank/dev-aryank`.

## Fastest setup

1. Open <https://github.com/dev-aryank/dev-aryank>.
2. Upload **all** files and folders from this package, including `.github` and `assets`.
3. Commit them to the repository's default branch (`main`).
4. Open the repository's **Actions** tab and enable workflows if GitHub asks.
5. Run **Generate contribution snake** once with **Run workflow**. This creates the `output` branch and makes the snake visible immediately.
6. Run **Refresh profile data** once to verify the live project and activity sections.

## What updates automatically

- Live GitHub stats and activity graph are rendered by their card services when the profile is viewed.
- The **Live project radar** and **Recent activity** sections refresh every hour through GitHub Actions.
- The animated contribution snake regenerates daily.
- Both workflows can also be run manually.

GitHub cannot trigger a workflow in the profile repository directly for every event in a different repository. The hourly refresh is therefore the reliable no-setup approximation. The included `repository_dispatch` trigger can be called from other repositories later if immediate cross-repository updates are desired.

## Optional personalization

The public GitHub profile currently has no public email, personal site, LinkedIn, or other social link. None were invented. When you are ready, add verified contact buttons near the end of `README.md`.

