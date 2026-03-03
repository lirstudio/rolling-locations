const settings = {
  title: "Settings",

  user: {
    title: "Profile Settings",
    description: "Update your personal information and preferences",
    profilePicture: "Profile Picture",
    uploadPhoto: "Upload photo",
    reset: "Reset",
    allowedFormats: "JPG, GIF or PNG. Max size 800K",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    language: "Language",
    bio: "Bio",
    bioPlaceholder: "Tell us a little about yourself...",
  },

  account: {
    title: "Account Settings",
    description: "Manage your account settings and preferences.",
    personalInfo: "Personal Information",
    personalInfoDescription: "Update your personal information that will be displayed on your profile.",
    changePassword: "Change Password",
    changePasswordDescription: "Update your password to keep your account secure.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    dangerZone: "Danger Zone",
    dangerZoneDescription: "Irreversible and destructive actions.",
    deleteAccount: "Delete Account",
    deleteAccountDescription: "Permanently delete your account and all associated data.",
  },

  saveChanges: "Save Changes",
  discard: "Discard",
  saved: "Changes saved successfully",

  languages: {
    he: "עברית",
    en: "English",
  },
} as const;

export default settings;
