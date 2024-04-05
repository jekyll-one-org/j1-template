Setting the expiry date to the past using Javascript for a existing cookie
work for **localhost** but fail for a **domain**.
What could the reason?

Setting the expiry date of a cookie to the past is a common technique used
to **delete** a cookie. When a cookie's expiry date is set to the past, the
browser will **remove the cookie** from its storage.

Setting a cookie's expiry date to the past in JavaScript works differently
for **localhost** and a **domain** due to browser **security restrictions**.

**Localhost**: When working on your local machine (localhost), browsers
are more lenient with cookie manipulation. Setting the expiry date to a
past date essentially tells the browser to delete the cookie.

**Domain**: For actual domains, browsers are stricter to prevent malicious
scripts from deleting important cookies. Setting a past expiry date might
not always delete the cookie **immediately**.

However, the behavior you're describing, where setting the expiry date to
the past works for localhost but fails for a domain, could be due to several
reasons:

**Domain Mismatch**:
Ensure that you are setting the cookie for the correct **domain**. If you
are attempting to delete a cookie set for a specific domain (example.com),
make sure that you're accessing the website using the **same domain** and not
a subdomain (www.example.com).

**Path Attribute**:
When setting the cookie, make sure you're setting the correct **path**
attribute. If a cookie was set with a specific path, you need to specify
the same path when trying to delete it. If you set the path attribute when
creating the cookie, you need to include the same path when deleting it.

**Secure Attribute**:
If the cookie was originally set with the Secure attribute (indicating it
should only be sent over HTTPS), make sure you are **using HTTPS** when
attempting to delete it. Some browsers might enforce this behavior strictly.

**HttpOnly Attribute**:
If the cookie has the **HttpOnly** attribute **set**, it cannot be
manipulated via **client-side JavaScript**. You must handle the deletion
on the **server-side** if this attribute is set.

**Subdomains**:
For cookies set with a **leading dot** in the domain attribute (.example.com),
they are accessible **across subdomains**. Make sure you're setting the
cookie for the appropriate **subdomain** or using a more specific domain when
deleting it.

**Browser Caching**:
Sometimes, browsers may cache cookies, and changes may not take effect
immediately. Try clearing your browser cache or using a private browsing
window to ensure you're not experiencing caching issues.

By ensuring these factors are correctly handled, you should be able to delete
cookies effectively both for localhost and domain scenarios. If the issue
persists, double-check your code for any inconsistencies or errors in setting
or deleting the cookie.
