
import hashlib
import base64

# The script content from root.tsx (including whitespace as it appears in the template literal)
# I'll try to match the indentation carefully.
script_content = """
            (function() {
              try {
                var theme = localStorage.getItem("theme");
                var supportDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches === true;
                if (theme === "dark" || (!theme && supportDarkMode)) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (e) {}
            })();
          """

# We might need to trim the first newline if the template literal ignores it, 
# or maybe Qwik trims it?
# Let's try exact string first.

def print_hash(content, name):
    hash_obj = hashlib.sha256(content.encode('utf-8'))
    digest = hash_obj.digest()
    b64 = base64.b64encode(digest).decode('utf-8')
    print(f"{name}: sha256-{b64}")

print_hash(script_content, "Raw from file")
print_hash(script_content.strip(), "Stripped")
