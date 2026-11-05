// Set VITE_ADMIN_SITE=true when building the admin.northumberlandfitness.com
// bundle. Same codebase, same API — just a different route table and no
// public/marketing pages, so admin login lives on its own site entirely.
export const IS_ADMIN_SITE = import.meta.env.VITE_ADMIN_SITE === "true";

// Memberships are sold through FLiiP, so member accounts on this site are
// hidden. Flip to true to bring back /login, /register and /account.
export const MEMBER_ACCOUNTS_ENABLED = false;

// Shows "Coming Soon" in place of the class timetable, even if classes are saved in the admin
// panel. Flip to false once the real timetable is ready to show them.
export const TIMETABLE_COMING_SOON = true;

// Hides the "Specialized Programs" section and its navbar/footer links. Flip to true to show it again.
export const SHOW_PROGRAMS = false;

// General FLiiP page where the buyer picks a plan: the "Buy a Membership" button and plan cards without their own link.
export const MEMBERSHIP_SALES_URL = "https://northumberland.fliipapp.com/user/register/buy_membership/1/71597";

// FLiiP checkout for the Individual membership, which the navbar banner sends visitors to.
export const INDIVIDUAL_MEMBERSHIP_URL = "https://northumberland.fliipapp.com/user/register/buy_membership/1/72022";
