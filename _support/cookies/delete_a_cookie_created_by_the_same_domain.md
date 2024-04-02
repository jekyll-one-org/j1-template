Howto delete a cookie created by the same domain having the secure attribute enabled?

You can't directly delete a secure cookie using Javascript because of the
security measures in place. The "Secure" attribute restricts access to the
cookie only over HTTPS connections and prevents modification by Javascript
for protection against vulnerabilities like XSS (Cross-Site Scripting).

Here's how you can achieve deleting a secure cookie:

Server-side Deletion:

If your application controls the server-side logic, you can send a *new*
cookie with the *same name and path* as the one you want to delete but with
an *expiry date set in the past*. This will instruct the browser to remove
the cookie.

Client-side Management (Javascript):

Though deleting isn't possible directly, you can instruct the browser to
effectively *forget* the cookie by setting a *new cookie* with the *same name, path, and domain attributes*
but with an *expiry date in the past* and the "Secure" attribute set (if
it was present in the original cookie).

This won't technically delete the cookie from storage, but the browser will
treat it as expired and won't send it back to the server on subsequent
requests.

Important Note:

Make sure you include the "Secure" attribute when setting the *new cookie*
with the past expiry date, especially if it was present in the *original*
cookie. This ensures consistency and maintains the security posture of the
cookie.
