// ============================================================
// Shared helpers used across login/dashboard/details pages
// ============================================================

const Api = {
  async _get(params) {
    const url = new URL(window.API_URL);
    Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
    const res = await fetch(url.toString(), { method: "GET" });
    return res.json();
  },
  async _post(params) {
    // text/plain avoids a CORS preflight against Apps Script
    const res = await fetch(window.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(params),
    });
    return res.json();
  },
  login(username, password) {
    return this._post({ action: "login", username, password });
  },
  register(payload) {
    return this._post({ action: "register", ...payload });
  },
  getRows({ page, pageSize, search }) {
    return this._get({
      action: "getRows",
      token: Session.token(),
      page,
      pageSize,
      search: search || "",
    });
  },
  getRowDetail(rowIndex) {
    return this._get({ action: "getRowDetail", token: Session.token(), rowIndex });
  },
  updateAction(rowIndex, actionValue, remarks) {
    return this._post({
      action: "updateAction",
      token: Session.token(),
      rowIndex,
      actionValue,
      remarks,
    });
  },
};

const Session = {
  save(data) {
    localStorage.setItem("tdp_token", data.token);
    localStorage.setItem("tdp_name", data.name || "");
    localStorage.setItem("tdp_designation", data.designation || "");
    localStorage.setItem("tdp_role", data.role || "");
  },
  token() {
    return localStorage.getItem("tdp_token");
  },
  name() {
    return localStorage.getItem("tdp_name") || "Admin";
  },
  designation() {
    return localStorage.getItem("tdp_designation") || "";
  },
  clear() {
    localStorage.removeItem("tdp_token");
    localStorage.removeItem("tdp_name");
    localStorage.removeItem("tdp_designation");
    localStorage.removeItem("tdp_role");
  },
  requireAuth() {
    if (!this.token()) {
      window.location.href = "index.html";
    }
  },
};

function configureCheck() {
  if (!window.API_URL || window.API_URL.indexOf("PASTE_YOUR") !== -1) {
    const div = document.createElement("div");
    div.className = "alert alert-danger m-3";
    div.innerHTML =
      "<strong>Setup needed:</strong> open <code>assets/config.js</code> and paste your Google Apps Script Web App URL.";
    document.body.prepend(div);
    return false;
  }
  return true;
}
