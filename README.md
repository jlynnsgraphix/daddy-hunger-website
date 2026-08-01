# Daddy Hunger CMS Website

This package converts the approved Daddy Hunger HTML site into an editable static website.

## What is included

- The original burgundy, gold, and cream design
- Home, About, Book, Free Guide, Speaking, Shop, and Thank You pages
- Decap CMS at `/admin/`
- Editable text, images, book information, launch date, guide PDF, products, checkout links, and Ray's portrait
- Netlify Forms for the guide list, book launch list, shop list, and speaking inquiries
- A no-dependency Node build, so Netlify does not need to install a framework

## How the editing system works

1. The editable content lives in `src/content/*.json`.
2. Decap CMS gives you a browser-based editor for those files.
3. Publishing an edit saves it to GitHub.
4. Netlify runs `npm run build` and republishes the site.
5. The public website is generated in `_site/`.

Do not manually edit `_site/`. It is rebuilt every time the site is published.

## Step 1: Put the project on GitHub

Create a new GitHub repository, such as `daddy-hunger-website`, and upload the contents of this folder to it. The files in this folder must be at the repository root.

Then configure the CMS repository name. Either edit the first lines of `src/admin/config.yml`:

```yaml
backend:
  name: github
  repo: YOUR_GITHUB_USERNAME/daddy-hunger-website
  branch: main
```

Or run:

```bash
node configure-cms.js YOUR_GITHUB_USERNAME daddy-hunger-website
```

Commit and push that change to GitHub.

## Step 2: Deploy the GitHub repository on Netlify

In Netlify:

1. Select **Add new project**.
2. Select **Import an existing project**.
3. Choose GitHub and select the Daddy Hunger repository.
4. Publish the project.

The included `netlify.toml` supplies these settings automatically:

- Build command: `npm run build`
- Publish directory: `_site`

## Step 3: Set up GitHub login for the CMS

Every person who edits the website through Decap CMS must have push access to the GitHub repository.

### Create a GitHub OAuth application

In GitHub, create a new OAuth App with:

- Homepage URL: your Netlify site URL or `https://daddyhunger.org`
- Authorization callback URL: `https://api.netlify.com/auth/done`

Copy the Client ID and generate a Client Secret.

### Install the provider in Netlify

In the Netlify project, go to:

**Project configuration → Access & security → OAuth → Authentication providers**

Install GitHub as a provider, then enter the Client ID and Client Secret.

## Step 4: Open the website editor

Visit:

```text
https://YOUR-SITE.netlify.app/admin/
```

Or, after the domain is connected:

```text
https://daddyhunger.org/admin/
```

Choose **Login with GitHub**. The editor contains these sections:

- Global Settings
- Home Page
- About Page
- Book Page
- Free Guide Page
- Speaking Page
- Shop Page

Click **Publish** after making a change. GitHub receives the edit and Netlify automatically rebuilds the live website.

## Step 5: Turn on the forms

In the Netlify project:

1. Open **Forms**.
2. Select **Enable form detection**.
3. Trigger a new deployment.

The site contains five separate forms:

- `home-guide-signup`
- `guide-download`
- `book-launch-list`
- `shop-launch-list`
- `speaking-inquiry`

Submissions will appear under the Forms tab. The guide forms open the PDF after a successful submission.

## Editing the website

### Change the book release date everywhere

Open **Global Settings** and edit:

- Release Label
- Release Short Label

### Add Ray's photograph

Open **Global Settings → Ray Author Photo**, upload the image, and publish. The RU placeholders will automatically be replaced throughout the website.

### Replace the book cover or guide

Open **Global Settings** and replace:

- Book Cover
- Full Book Cover Spread
- Free Guide PDF

### Start selling the book

Open **Book Page** and enter the Purchase URL. The purchase button will appear automatically. Leave the URL blank to hide it.

### Add merchandise

Open **Shop Page → Products**. Each product can have:

- Product photograph
- Name
- Price or launch status
- Button label
- Product or checkout URL

The product button stays hidden until a URL is added.

## Local preview

Node 18 or newer is required.

```bash
npm run build
npm run preview
```

Then open `http://localhost:8080`.

The live CMS login will only work after the site is connected to GitHub and the OAuth provider is configured.

## Important folders

- `src/content/`: editable website content
- `src/assets/`: logos, book images, guide, and uploaded media
- `src/admin/`: Decap CMS editor and configuration
- `src/styles.css`: website design
- `build.js`: static-site builder
- `_site/`: generated website, do not edit manually
