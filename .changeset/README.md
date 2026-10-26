# Changesets

Every pull request that changes a package adds a changeset: `npm run changeset`, choose the packages and the kind of
change (patch, minor, major, as defined in the documentation under Principles › Versioning), and describe it in one
sentence for the people who use the system. `npm run version` turns the changesets into versions and changelogs.

Tokens and components are versioned together, so a version number names one consistent system.
