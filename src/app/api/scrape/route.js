import puppeteer from "puppeteer"

export async function POST(req) {
  const { industry, location } = await req.json()

  if (!industry || !location) {
    return Response.json(
      { error: "Industry and Location are required" },
      { status: 400 }
    )
  }

  let browser
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()
    await page.goto(
      `https://www.google.com/maps/search/${encodeURIComponent(
        `${industry} in ${location}`
      )}`,
      {
        waitUntil: "networkidle2",
        timeout: 60000,
      }
    )

    console.log("Page loaded")

    await page.waitForSelector("div[role='feed']", { timeout: 20000 })

    // Scroll inside the results container
    const resultsSelector = "div[role='feed']"
    let prevHeight = 0
    let maxScrollAttempts = 10
    let attempt = 0

    while (attempt < maxScrollAttempts) {
      prevHeight = await page.evaluate((selector) => {
        const scrollableDiv = document.querySelector(selector)
        return scrollableDiv ? scrollableDiv.scrollHeight : 0
      }, resultsSelector)

      await page.evaluate((selector) => {
        const scrollableDiv = document.querySelector(selector)
        if (scrollableDiv) {
          scrollableDiv.scrollBy(0, scrollableDiv.scrollHeight)
        }
      }, resultsSelector)

      await new Promise((resolve) => setTimeout(resolve, 3000))

      let newHeight = await page.evaluate((selector) => {
        const scrollableDiv = document.querySelector(selector)
        return scrollableDiv ? scrollableDiv.scrollHeight : 0
      }, resultsSelector)

      if (newHeight === prevHeight) break
      attempt++
    }

    console.log(`Scrolling finished after ${attempt} attempts`)

    // **Extract Business Data**
    const businesses = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".Nv2PK")).map((el) => {
        // Get all `.W4Efsd` elements inside this business container
        const allDetails = Array.from(
          el.querySelectorAll(".W4Efsd:nth-child(1)")
        )

        let address = "N/A"

        // **Find the correct `.W4Efsd` that contains an address**
        for (let detail of allDetails) {
          const spans = Array.from(detail.querySelectorAll("span:nth-child(2)"))

          for (let span of spans) {
            const text = span.innerText.trim()
            // **Check if this span contains a valid address (not rating, phone, or category)**
            if (
              text &&
              !text.includes("⋅") &&
              !text.match(/[0-9]{3}\s?[0-9]{3}[-\s]?[0-9]{4}/) &&
              text.length > 5
            ) {
              address = text
              break
            }
          }

          if (address !== "N/A") break
        }

        // **Extract Website Link**
        const websiteLink = el.querySelector("a.lcr4fd")?.href || "N/A"

        return {
          name: el.querySelector(".qBF1Pd")?.innerText || "N/A",
          address: address.trim(),
          phone: el.querySelector(".UsdlK")?.innerText || "N/A",
          rating: el.querySelector(".MW4etd")?.innerText || "N/A",
          reviews: el.querySelector(".UY7F9")?.innerText || "N/A",
          website: websiteLink,
          link: el.querySelector("a")?.href || "N/A",
        }
      })
    })

    console.log("Total Businesses Scraped:", businesses.length)

    await browser.close()
    return Response.json({ businesses }, { status: 200 })
  } catch (error) {
    if (browser) await browser.close()
    console.error("Scraping Error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
