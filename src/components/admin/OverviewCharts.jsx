import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "@/components/admin/adminUi";
import { formatCurrency } from "@/lib/format";

const PALETTE = ["#174D38", "#173451", "#D4AF37", "#6B8F7B", "#8A9BA8", "#B08D3F"];

function ChartFrame({ title, subtitle, children }) {
  return (
    <Panel>
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="h-[260px] px-2 py-3">{children}</div>
    </Panel>
  );
}

export default function OverviewCharts({ data }) {
  const { revenue = [], currencies = [], byProject = [], byCountry = [], projectStatus = [], donorSplit = [] } = data;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartFrame title="Monthly donation revenue" subtitle="Verified donations over the last twelve months">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenue} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4E5C6A" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#4E5C6A" }} axisLine={false} tickLine={false} width={56} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#E5E7EB" }}
              formatter={(value, name) => [formatCurrency(value, name), name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {currencies.map((currency, index) => (
              <Bar key={currency} dataKey={currency} fill={PALETTE[index % PALETTE.length]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Donations by project" subtitle="Verified totals per project">
        {byProject.length === 0 ? (
          <p className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
            No verified donations in this period.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byProject} layout="vertical" margin={{ top: 8, right: 20, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#4E5C6A" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 10, fill: "#4E5C6A" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#E5E7EB" }} />
              <Bar dataKey="amount" fill="#174D38" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartFrame>

      <ChartFrame title="Donations by country" subtitle="Where verified giving comes from">
        {byCountry.length === 0 ? (
          <p className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
            No verified donations in this period.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCountry} dataKey="amount" nameKey="name" outerRadius={88} innerRadius={48} paddingAngle={2}>
                {byCountry.map((entry, index) => (
                  <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#E5E7EB" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartFrame>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChartFrame title="Projects by status" subtitle="Current portfolio">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={projectStatus} dataKey="value" nameKey="name" outerRadius={80} innerRadius={42} paddingAngle={2}>
                {projectStatus.map((entry, index) => (
                  <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#E5E7EB" }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartFrame>

        <ChartFrame title="Donor mix" subtitle="Registered accounts vs guests">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donorSplit} dataKey="value" nameKey="name" outerRadius={80} innerRadius={42} paddingAngle={2}>
                {donorSplit.map((entry, index) => (
                  <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#E5E7EB" }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartFrame>
      </div>
    </div>
  );
}