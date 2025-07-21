;/>
\
1. **Add a helper to
return the
active(first)
demo
user**

```ts
/**
 * Return the currently “logged-in” user.
 * In this demo we simply return the first admin
 * or the first user if no admin exists.
 */
export const getCurrentUser = (): User | null => {
  const users = getDemoUsers()
  return users.find(u => u.role === "administrator") ?? users[0] ?? null
}
