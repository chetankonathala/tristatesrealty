import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import type { Lead } from "@/types/lead";

interface NewLeadEmailProps {
  lead: Pick<Lead, "name" | "email" | "phone" | "message" | "community_name" | "floor_plan_name" | "listing_address" | "listing_url">;
  dashboardUrl: string;
}

const colors = {
  bg: "#0A0A0A",
  card: "#141414",
  text: "#F5F5F0",
  muted: "#9CA3AF",
  accent: "#C9A84C",
  border: "#262626",
  green: "#22C55E",
};

export function NewLeadEmail({ lead, dashboardUrl }: NewLeadEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New buyer inquiry from {lead.name} — {lead.community_name ?? "Tri States Realty"}</Preview>
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
          {/* Header */}
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

          {/* Alert banner */}
          <Section
            style={{
              marginTop: 24,
              backgroundColor: colors.card,
              borderRadius: 8,
              border: `1px solid ${colors.accent}`,
              padding: "20px 24px",
            }}
          >
            <Text
              style={{
                color: colors.accent,
                fontFamily: "Georgia, serif",
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
              }}
            >
              New Buyer Inquiry
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, margin: "4px 0 0" }}>
              A potential buyer has submitted a contact form on your website.
            </Text>
          </Section>

          {/* Buyer info */}
          <Section
            style={{
              marginTop: 16,
              backgroundColor: colors.card,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              padding: "20px 24px",
            }}
          >
            <Heading
              as="h3"
              style={{ color: colors.text, fontSize: 14, fontWeight: 700, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.1em" }}
            >
              Buyer Information
            </Heading>

            <Row style={{ marginBottom: 10 }}>
              <Column style={{ width: "35%" }}>
                <Text style={{ color: colors.muted, fontSize: 12, margin: 0 }}>Name</Text>
              </Column>
              <Column>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: 700, margin: 0 }}>
                  {lead.name}
                </Text>
              </Column>
            </Row>

            <Row style={{ marginBottom: 10 }}>
              <Column style={{ width: "35%" }}>
                <Text style={{ color: colors.muted, fontSize: 12, margin: 0 }}>Email</Text>
              </Column>
              <Column>
                <Link href={`mailto:${lead.email}`} style={{ color: colors.accent, fontSize: 14, margin: 0 }}>
                  {lead.email}
                </Link>
              </Column>
            </Row>

            {lead.phone && (
              <Row style={{ marginBottom: 10 }}>
                <Column style={{ width: "35%" }}>
                  <Text style={{ color: colors.muted, fontSize: 12, margin: 0 }}>Phone</Text>
                </Column>
                <Column>
                  <Link href={`tel:${lead.phone}`} style={{ color: colors.accent, fontSize: 14, margin: 0 }}>
                    {lead.phone}
                  </Link>
                </Column>
              </Row>
            )}
          </Section>

          {/* Property interest */}
          {(lead.community_name || lead.floor_plan_name || lead.listing_address) && (
            <Section
              style={{
                marginTop: 16,
                backgroundColor: colors.card,
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                padding: "20px 24px",
              }}
            >
              <Heading
                as="h3"
                style={{ color: colors.text, fontSize: 14, fontWeight: 700, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                Property of Interest
              </Heading>

              {lead.community_name && (
                <Row style={{ marginBottom: 10 }}>
                  <Column style={{ width: "35%" }}>
                    <Text style={{ color: colors.muted, fontSize: 12, margin: 0 }}>Community</Text>
                  </Column>
                  <Column>
                    <Text style={{ color: colors.text, fontSize: 14, margin: 0 }}>{lead.community_name}</Text>
                  </Column>
                </Row>
              )}

              {lead.floor_plan_name && (
                <Row style={{ marginBottom: 10 }}>
                  <Column style={{ width: "35%" }}>
                    <Text style={{ color: colors.muted, fontSize: 12, margin: 0 }}>Floor Plan</Text>
                  </Column>
                  <Column>
                    <Text style={{ color: colors.text, fontSize: 14, margin: 0 }}>{lead.floor_plan_name}</Text>
                  </Column>
                </Row>
              )}

              {lead.listing_address && (
                <Row style={{ marginBottom: 10 }}>
                  <Column style={{ width: "35%" }}>
                    <Text style={{ color: colors.muted, fontSize: 12, margin: 0 }}>Location</Text>
                  </Column>
                  <Column>
                    <Text style={{ color: colors.text, fontSize: 14, margin: 0 }}>{lead.listing_address}</Text>
                  </Column>
                </Row>
              )}

              {lead.listing_url && (
                <Row style={{ marginBottom: 0 }}>
                  <Column style={{ width: "35%" }}>
                    <Text style={{ color: colors.muted, fontSize: 12, margin: 0 }}>Listing</Text>
                  </Column>
                  <Column>
                    <Link href={lead.listing_url} style={{ color: colors.accent, fontSize: 14, margin: 0 }}>
                      View listing →
                    </Link>
                  </Column>
                </Row>
              )}
            </Section>
          )}

          {/* Message */}
          {lead.message && (
            <Section
              style={{
                marginTop: 16,
                backgroundColor: colors.card,
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                padding: "20px 24px",
              }}
            >
              <Heading
                as="h3"
                style={{ color: colors.text, fontSize: 14, fontWeight: 700, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                Their Message
              </Heading>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: "1.6", margin: 0, fontStyle: "italic" }}>
                &ldquo;{lead.message}&rdquo;
              </Text>
            </Section>
          )}

          {/* CTA */}
          <Section style={{ marginTop: 24, textAlign: "center" }}>
            <Link
              href={dashboardUrl}
              style={{
                backgroundColor: colors.accent,
                color: colors.bg,
                padding: "14px 28px",
                borderRadius: 6,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
                fontSize: 14,
              }}
            >
              View All Leads in Dashboard →
            </Link>
          </Section>

          <Hr style={{ borderColor: colors.border, marginTop: 32 }} />
          <Section style={{ textAlign: "center", marginTop: 16 }}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>
              {`© ${new Date().getFullYear()} Tri States Realty. Powered by Schell Brothers listings.`}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default NewLeadEmail;
