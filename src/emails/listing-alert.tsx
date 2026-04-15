import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import type { ListingSummary } from "@/types/listing";

interface ListingAlertEmailProps {
  searchName: string;
  listings: ListingSummary[];
  manageUrl: string;
  unsubscribeUrl: string;
  baseUrl?: string;
}

const colors = {
  bg: "#0A0A0A",
  card: "#141414",
  text: "#F5F5F0",
  muted: "#9CA3AF",
  accent: "#C9A84C",
  border: "#262626",
};

export function ListingAlertEmail({
  searchName,
  listings,
  manageUrl,
  unsubscribeUrl,
  baseUrl = "https://tristatesrealty.com",
}: ListingAlertEmailProps) {
  const count = listings.length;
  const subjectPreview =
    count === 1
      ? `A new home matches '${searchName}'`
      : `${count} new homes match '${searchName}'`;
  return (
    <Html>
      <Head />
      <Preview>{subjectPreview}</Preview>
      <Body
        style={{
          backgroundColor: colors.bg,
          fontFamily: "Helvetica, Arial, sans-serif",
          color: colors.text,
          margin: 0,
          padding: 0,
        }}
      >
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
          <Section>
            <Heading
              style={{
                color: colors.accent,
                fontFamily: "Georgia, serif",
                fontSize: 24,
                letterSpacing: "0.1em",
                textAlign: "center",
                margin: 0,
              }}
            >
              TRI STATES REALTY
            </Heading>
          </Section>
          <Section style={{ marginTop: 32, textAlign: "center" }}>
            <Heading
              as="h2"
              style={{ color: colors.text, fontFamily: "Georgia, serif", fontSize: 28 }}
            >
              {count === 1
                ? "A new home matches your search"
                : `${count} new homes match your search`}
            </Heading>
            <Text style={{ color: colors.muted, fontSize: 16 }}>
              These just came on the market matching{" "}
              <strong style={{ color: colors.text }}>&ldquo;{searchName}&rdquo;</strong>.
            </Text>
          </Section>
          <Section style={{ marginTop: 24 }}>
            {listings.slice(0, 6).map((l) => (
              <Row
                key={l.mls_id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  marginBottom: 16,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Column style={{ width: 200, padding: 12 }}>
                  {l.photos[0] && (
                    <Img
                      src={l.photos[0]}
                      width={180}
                      height={135}
                      alt={l.address_full}
                      style={{ borderRadius: 4, objectFit: "cover" }}
                    />
                  )}
                </Column>
                <Column style={{ verticalAlign: "top", padding: "12px 12px 12px 0" }}>
                  <Text
                    style={{ color: colors.accent, fontSize: 18, fontWeight: 700, margin: 0 }}
                  >
                    ${l.list_price.toLocaleString()}
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 14, margin: "4px 0" }}>
                    {l.address_full}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12, margin: 0 }}>
                    {l.bedrooms ?? "—"} bd · {l.bathrooms ?? "—"} ba ·{" "}
                    {l.area?.toLocaleString() ?? "—"} sqft
                  </Text>
                  <Link
                    href={`${baseUrl}/listings/${l.mls_id}`}
                    style={{
                      color: colors.accent,
                      fontSize: 13,
                      textDecoration: "underline",
                      marginTop: 8,
                      display: "inline-block",
                    }}
                  >
                    View listing →
                  </Link>
                </Column>
              </Row>
            ))}
          </Section>
          <Section style={{ marginTop: 24, textAlign: "center" }}>
            <Link
              href={`${baseUrl}/listings`}
              style={{
                backgroundColor: colors.accent,
                color: colors.bg,
                padding: "14px 28px",
                borderRadius: 6,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View New Homes
            </Link>
          </Section>
          <Hr style={{ borderColor: colors.border, marginTop: 32 }} />
          <Section style={{ textAlign: "center", marginTop: 16 }}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>
              <Link href={manageUrl} style={{ color: colors.muted }}>
                Manage this alert
              </Link>
              {" · "}
              <Link href={unsubscribeUrl} style={{ color: colors.muted }}>
                Unsubscribe from this search
              </Link>
            </Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>
              {"© "}
              {new Date().getFullYear()}
              {" Tri States Realty. Listings from Bright MLS. Equal Housing Opportunity."}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ListingAlertEmail;
