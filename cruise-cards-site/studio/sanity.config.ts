{
  "displayName": "MoveAroundTMS_SolisTrucking",
  "version": 1,
  "pages": [
    {
      "id": "main",
      "name": "Dashboard",
      "components": [
        {
          "type": "container",
          "props": {
            "background": "#ffffff",
            "header": {
              "text": "Move Around TMS™ | Powered by IGOTTA Technologies | Solis Trucking LLC",
              "color": "#0a3d91",
              "style": "font-weight:bold;font-size:20px;padding:10px;"
            },
            "banner": {
              "text": "⚠️ TEST MODE — Internal Testing Only",
              "background": "#fffae5",
              "color": "#a67c00",
              "style": "text-align:center;padding:6px;font-weight:bold;"
            }
          }
        },
        {
          "type": "tabs",
          "props": {
            "tabs": [
              "Dashboard",
              "Aggregates",
              "Dispatch",
              "Drivers",
              "HR",
              "Payroll",
              "Fleet",
              "Maintenance",
              "Invoices",
              "Expenses",
              "Compliance",
              "Reports",
              "Settings"
            ],
            "activeColor": "#0a3d91",
            "inactiveColor": "#888"
          }
        }
      ]
    }
  ],
  "resources": [
    { "name": "MoveAroundTMS_SolisTrucking", "type": "postgresql" }
  ],
  "roles": ["owner","admin","hr","staff","driver"],
  "theme": {
    "mode": "light",
    "primaryColor": "#0a3d91",
    "accentColor": "#f8c21c",
    "backgroundColor": "#ffffff"
  }
}

