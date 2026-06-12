import express from "express";
import fetch from "node-fetch";
import cors from "cors";

// إعداد التطبيق
const app = express();

// تفعيل CORS للسماح بالطلبات من موقعك
app.use(cors());
// تفعيل استقبال البيانات بصيغة JSON
app.use(express.json());

// 1. صفحة الترحيب وفحص الحالة
app.get("/", (req, res) => {
  res.send("🚀 Prince Proxy Server is running and ready to fetch links and status!");
});

// 2. جلب حالة طلب واحد (Single Status)
app.post("/status", async (req, res) => {
  try {
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({ error: "رقم الطلب (order) مفقود في الطلب" });
    }

    const response = await fetch("https://prince.services/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key: process.env.prince_API_KEY, 
        action: "status",
        order: String(order)
      })
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "فشل في معالجة بيانات السيرفر الأصلي", raw: text });
    }
  } catch (err) {
    res.status(500).json({ error: "خطأ في الاتصال بالسيرفر", message: err.message });
  }
});

// 3. جلب حالة عدة طلبات (Multi Orders Status)
app.post("/orders", async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders) {
      return res.status(400).json({ error: "قائمة الطلبات (orders) مفقودة" });
    }

    const response = await fetch("https://prince.services/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key: process.env.prince_API_KEY,
        action: "status",
        orders: String(orders) // تحويلها لنص لضمان إرسالها مفصولة بفاصلة كـ String
      })
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "خطأ في تحليل البيانات", raw: text });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. إلغاء الطلبات (Cancel Orders)
app.post("/cancel", async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders) {
      return res.status(400).json({ error: "قائمة الطلبات للإلغاء مفقودة" });
    }

    const response = await fetch("https://prince.services/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key: process.env.prince_API_KEY,
        action: "cancel",
        orders: String(orders)
      })
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "خطأ في تنفيذ عملية الإلغاء", raw: text });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إعداد المنفذ وتشغيل السيرفر محلياً (لن يؤثر على Vercel)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ✅ Proxy Server is Live!
  📍 Port: ${PORT}
  🔗 Action: Status, Orders, Cancel
  `);
});

// 🌟 السطر السحري والأساسي ليعمل الكود على Vercel بدون مشاكل 🌟
export default app;
