export function normalizeProfileUser(user) {
  if (!user) return user;

  return {
    ...user,
    role: typeof user.role === "string" ? user.role.toLowerCase() : user.role,
    gender: typeof user.gender === "string" ? user.gender.toLowerCase() : user.gender,
  };
}
