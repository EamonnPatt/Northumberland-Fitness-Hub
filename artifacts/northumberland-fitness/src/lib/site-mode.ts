// Set VITE_ADMIN_SITE=true when building the admin.northumberlandfitness.com
// bundle. Same codebase, same API — just a different route table and no
// public/marketing pages, so admin login lives on its own site entirely.
export const IS_ADMIN_SITE = import.meta.env.VITE_ADMIN_SITE === "true";

// Memberships are sold through FLiiP, so member accounts on this site are
// hidden. Flip to true to bring back /login, /register and /account.
export const MEMBER_ACCOUNTS_ENABLED = false;
