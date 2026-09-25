self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "notify" && data.title) {
    self.registration.showNotification(data.title, {
      body: data.body || "",
      icon: "logo.png"
    });
  }
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("notifications.html"));
});
