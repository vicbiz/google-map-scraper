import { Card } from "@/components/ui/card"

export default function BusinessList({ businesses }) {
  if (businesses.length === 0) {
    return <p className="text-center text-gray-500">No results found.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {businesses.map((biz, index) => (
        <Card key={index} className="p-4">
          <h3 className="text-lg font-bold">{biz.name}</h3>
          {biz.address !== "N/A" && (
            <p className="text-sm text-gray-600">{biz.address}</p>
          )}
          <p className="text-sm">📞 {biz.phone}</p>
          <p className="text-sm">
            ⭐ {biz.rating} ({biz.reviews} reviews)
          </p>
          <p className="text-sm" target="_blank">
            <a className="text-blue-500 underline" href={biz.website}>
              Website
            </a>
          </p>
          <p className="mt-4">
            <a
              href={biz.link}
              target="_blank"
              className="text-blue-500 underline"
            >
              View on Google Maps
            </a>
          </p>
        </Card>
      ))}
    </div>
  )
}
