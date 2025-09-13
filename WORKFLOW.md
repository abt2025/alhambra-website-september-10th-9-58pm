# Development Workflow

This document outlines the development workflow for the Alhambra Bank & Trust interactive website.

## Branching Strategy

- **main**: This branch is for production-ready code only. All pull requests to main must be reviewed and approved.
- **develop**: This is the primary development branch. All feature branches should be created from develop.
- **feature/***': These are for new features. For example, `feature/add-new-service`.

## Adding New Features

1. Create a new branch from `develop`:
   ```bash
   git checkout -b feature/your-feature-name develop
   ```
2. Make your changes and commit them.
3. Push your feature branch to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Create a pull request to merge your feature branch into `develop`.

## Updating Content

All multi-language content is stored in `/src/multiLanguageContent.js`. To update any text on the website, edit the corresponding string in this file.

## Deployment

The website is deployed automatically when changes are merged into the `main` branch. The deployment process is handled by a GitHub Actions workflow.

