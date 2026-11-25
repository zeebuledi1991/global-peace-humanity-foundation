// Hands the donor to the provider's hosted checkout exactly as the provider
// documents it: a GET redirect, or a form POST for gateways that expect one.
export function submitCheckoutAction(action) {
  if (!action?.url) return false;
  if (String(action.method || "GET").toUpperCase() === "POST") {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action.url;
    form.style.display = "none";
    Object.entries(action.fields || {}).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value == null ? "" : String(value);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    return true;
  }
  window.location.href = action.url;
  return true;
}