// ============================================================
// Shared helpers used across login/dashboard/details pages
// ============================================================

const Api = {
  async _get(params) {
    const url = new URL(window.API_URL);
    Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
    url.searchParams.set("_ts", Date.now()); // cache-buster
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
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
  getRows({ page, pageSize, search, status }) {
    return this._get({
      action: "getRows",
      token: Session.token(),
      page,
      pageSize,
      search: search || "",
      status: status || "all",
    });
  },
  exportRows(status) {
    return this._get({ action: "exportRows", token: Session.token(), status: status || "all" });
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

// Toggle a password field between hidden/visible, swapping the eye icon.
function togglePasswordField(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("bi-eye");
    icon.classList.add("bi-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("bi-eye-slash");
    icon.classList.add("bi-eye");
  }
}

// Build and trigger download of a CSV file from headers + rows arrays.
function downloadCsv(filename, headers, rows) {
  const esc = (v) => {
    if (v === null || v === undefined) v = "";
    v = String(v);
    if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  };
  const lines = [headers.map(esc).join(",")].concat(
    rows.map((r) => r.map(esc).join(","))
  );
  const csv = "\uFEFF" + lines.join("\r\n"); // BOM for correct Bangla display in Excel
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
