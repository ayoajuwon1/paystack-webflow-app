const WEBFLOW_API = "https://api.webflow.com/v2";

export async function registerInlineScript(
  accessToken: string,
  siteId: string,
  options: {
    sourceCode: string;
    displayName: string;
    version: string;
  }
) {
  const res = await fetch(
    `${WEBFLOW_API}/sites/${siteId}/registered_scripts/inline`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceCode: options.sourceCode,
        version: options.version,
        displayName: options.displayName,
        canCopy: false,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to register script: ${res.status} ${err}`);
  }
  return res.json();
}

export async function applyScriptToPage(
  accessToken: string,
  pageId: string,
  scripts: Array<{ id: string; location: "header" | "footer"; version: string }>
) {
  const res = await fetch(
    `${WEBFLOW_API}/pages/${pageId}/custom_code`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scripts }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to apply script: ${res.status} ${err}`);
  }
  return res.json();
}

export async function removeScriptFromSite(
  accessToken: string,
  siteId: string,
  scriptId: string
) {
  const res = await fetch(
    `${WEBFLOW_API}/sites/${siteId}/registered_scripts/${scriptId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) throw new Error(`Failed to remove script: ${res.status}`);
}
