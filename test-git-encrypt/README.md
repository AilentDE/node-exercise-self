# Git-Crypt Test Project

## Project Purpose

This project is designed to test whether **git-crypt** can correctly encrypt `.env` files automatically when pushing to a repository. Through this test, we can verify the security of sensitive information (such as environment variables, API keys, etc.) in version control.

## Test Results

✅ Test Successful! git-crypt correctly encrypts `.env` files on push and automatically decrypts them on pull.

## Features

- 🔐 Automatically encrypts `.env*` files
- 🔑 Symmetric encryption key management
- 📦 Transparent encryption/decryption process
- 🛡️ Protects sensitive information from accidental exposure

## Installation

### 1. Install git-crypt

#### macOS (using Homebrew)

```bash
brew install git-crypt
```

#### Ubuntu/Debian

```bash
sudo apt-get install git-crypt
```

#### Windows (using Chocolatey)

```bash
choco install git-crypt
```

### 2. Install Project Dependencies

```bash
npm install
```

## Setup Instructions

### Initial Setup (Project Owner)

1. Initialize git-crypt

```bash
git-crypt init
```

2. Create `.gitattributes` file to specify files to encrypt

```bash
echo ".env* filter=git-crypt diff=git-crypt" > .gitattributes
```

3. Modify `.gitignore` to ensure `.env` is not ignored

```bash
echo "!.env" > .gitignore
```

4. Export encryption key (to share with collaborators)

```bash
git-crypt export-key ./keyfile
```

5. Create `.env` file

```bash
echo "MESSAGE=This is a secret message" > .env
echo "VERSION=1.0.0" >> .env
```

6. Commit and push

```bash
git add .
git commit -m "Add encrypted .env file"
git push
```

### Collaborator Setup

1. Clone the project

```bash
git clone <repository-url>
cd test-git-encrypt
```

2. Obtain keyfile (provided by project owner)

3. Unlock repository

```bash
git-crypt unlock ./keyfile
```

4. Install dependencies

```bash
npm install
```

## Running the Test

Run the following command to test if environment variables are correctly read:

```bash
npm start
```

**Expected Output:**

```
This is a secret message
Version: 1.0.0
```

## Verifying Encryption

### Method 1: Check Remote Repository

1. Directly view the `.env` file on GitHub/GitLab
2. You will see garbled or binary content instead of plain text

### Method 2: Use git-crypt status

```bash
git-crypt status
```

This will show which files are encrypted:

```
encrypted: .env
```

### Method 3: Lock and View

```bash
# Lock the repository
git-crypt lock

# View .env file content (will display encrypted content)
cat .env

# Unlock again
git-crypt unlock ./keyfile
```

## Project Structure

```
test-git-encrypt/
├── index.ts          # Test script that reads environment variables
├── .env              # Environment variables file (will be encrypted)
├── .gitattributes    # Specifies git-crypt encryption rules
├── .gitignore        # Git ignore rules
├── keyfile           # git-crypt encryption key
├── package.json      # Project dependencies
└── tsconfig.json     # TypeScript configuration
```

## Results Demonstration

### Local Development Environment (Unlocked State)

- ✅ `.env` file content is in **plain text**, readable normally
- ✅ Application runs normally and reads environment variables

### Git Repository (Remote)

- ✅ `.env` file content is **encrypted gibberish**
- ✅ Unauthorized users cannot read sensitive information
- ✅ `.env` content in commit history is also encrypted

### Collaborators (with keyfile)

- ✅ Can read normally after using `git-crypt unlock`
- ✅ Changes are automatically re-encrypted after pushing

## Important Notes

⚠️ **Important Reminders:**

1. **Keyfile Security**
   - Do not commit keyfile to Git
   - Share with collaborators through secure channels (e.g., encrypted messaging apps)
2. **Backup Keyfile**

   - Losing the keyfile means you cannot decrypt files
   - Recommended to keep backups in a secure location

3. **.gitignore Configuration**

   - Ensure `keyfile` is in `.gitignore` to prevent accidental commits
   - Use `!.env` to ensure `.env` can be tracked

4. **First Commit**
   - Files committed before setting up git-crypt will not be encrypted
   - Need to remove and re-commit them

## Resources

- [git-crypt Official Documentation](https://github.com/AGWA/git-crypt)
- [dotenv Documentation](https://www.npmjs.com/package/dotenv)
