import { ArrowDown, ArrowUp } from "lucide-react";

export interface PriceHistoryEntry {
  date: string;
  event: string;
  price: number;
  changePercent?: number;
}

interface PriceHistoryTableProps {
  history: PriceHistoryEntry[];
}

export function PriceHistoryTable({ history }: PriceHistoryTableProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
      <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-4">Price History</h2>
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No price history available for this listing.</p>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="px-4 py-3 font-bold uppercase text-[11px] tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-bold uppercase text-[11px] tracking-wider text-muted-foreground">Event</th>
                <th className="px-4 py-3 font-bold uppercase text-[11px] tracking-wider text-muted-foreground text-right">Price</th>
                <th className="px-4 py-3 font-bold uppercase text-[11px] tracking-wider text-muted-foreground text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-foreground">{row.event}</td>
                  <td className="px-4 py-3 text-foreground text-right tabular-nums">${row.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.changePercent != null ? (
                      <span className={`inline-flex items-center gap-1 ${row.changePercent < 0 ? "text-red-500" : "text-green-500"}`}>
                        {row.changePercent < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                        {Math.abs(row.changePercent).toFixed(1)}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
