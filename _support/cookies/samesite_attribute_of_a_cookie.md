What controls the SameSite attribute of a cookie?

The SameSite attribute of a cookie is controlled by the **server** when it
sets the cookie. It is part of the Set-Cookie header that the server sends
in response to an HTTP request.

The SameSite attribute allows a website to declare if a cookie should be
*restricted* to a **first-party or same-site** context. This attribute helps
mitigate certain types of cross-site request forgery (CSRF) and cross-site
scripting (XSS) attacks.

The possible values for the SameSite attribute are:

* **Strict**:
  Cookies with this attribute are only sent in a **first-party** context.
  They are **not** sent along with *cross-site* requests, providing a high
  level of protection against **CSRF attacks**.

* **Lax**:
  Cookies with this attribute are sent along with top-level navigation GET
  requests initiated by third-party websites (for example when a user clicks
  a link to navigate to another site). However, they are not sent with
  requests originating from a third-party site using methods such as <form>
  POST submissions or AJAX requests. This provides a balance between security
  and usability.

* **None**:
  Cookies with this attribute are sent along with both **first-party** and
  **third-party** requests. This attribute should only be used when necessary
  and must be accompanied by the Secure attribute to ensure the cookie is
  sent only over **HTTPS** connections. This setting is necessary for certain
  use cases like **embedded content** (for example embedded widgets or APIs)
  where cookies need to be sent with **cross-site** requests.

If the SameSite attribute is **not explicitly** set by the server, the cookie
will *default* to the SameSite attribute of **None**, which could potentially
introduce security vulnerabilities if the cookie is sensitive and not
intended for cross-site requests.

It's important for developers to be aware of the implications of the SameSite
attribute and to set it appropriately based on the security requirements and
usage patterns of their website or web application.
