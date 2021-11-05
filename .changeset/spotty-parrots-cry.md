---
'gqty': minor
---

Add new Core configuration `"depthLimit"` (by default is `15`), needed to prevent possible infinite recursion, after the specified depth is reached, the proxy creation is stopped returning `null`.
