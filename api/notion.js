// Proxy serverless: chuyển tiếp request tới Notion API và đính kèm token.
// Token đọc từ biến môi trường NOTION_TOKEN (đặt trong Vercel → Settings → Environment Variables).
// Trình duyệt không bao giờ thấy token; đồng thời giải quyết CORS.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Chỉ chấp nhận POST.' })
    return
  }

  const token = process.env.NOTION_TOKEN
  if (!token) {
    res.status(500).json({
      error: 'Chưa cấu hình NOTION_TOKEN. Vào Vercel → Settings → Environment Variables để thêm.',
    })
    return
  }

  let payload = req.body
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      payload = {}
    }
  }

  const { path, method = 'GET', body } = payload || {}

  // Chỉ cho phép gọi vào Notion API v1.
  if (!path || typeof path !== 'string' || !path.startsWith('/v1/')) {
    res.status(400).json({ error: 'Đường dẫn Notion không hợp lệ.' })
    return
  }

  try {
    const upstream = await fetch('https://api.notion.com' + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body ?? {}),
    })

    const text = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.send(text)
  } catch (e) {
    res.status(502).json({ error: 'Không gọi được Notion API.', detail: String(e) })
  }
}
