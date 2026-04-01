import Layout from "@/components/Layout";

const DonationPolicy = () => (
  <Layout>
    <div className="container py-16">
      <h1 className="font-serif text-4xl font-bold">Donation Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2024</p>
      <div className="mt-8 max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">How Donations Are Processed</h2><p>All donations are processed securely through our payment partners. 95% of each donation goes directly to the chosen charity, with 5% covering payment processing fees and platform operations.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Tax Receipts</h2><p>Donors receive an automated tax receipt via email for every donation. These receipts are valid for tax deduction purposes in most jurisdictions. Consult your local tax advisor for specifics.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Recurring Donations</h2><p>Recurring donations can be set up for monthly, quarterly, or annual intervals. You may modify or cancel recurring donations at any time through your account dashboard.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Refund Policy</h2><p>Donations are generally non-refundable. In exceptional circumstances (e.g., unauthorized transactions), refund requests can be submitted within 30 days of the donation date by contacting our support team.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Charity Verification</h2><p>All charities on CharityApp are verified nonprofits. We conduct regular audits to ensure funds are used appropriately. If a charity is removed from our platform, any remaining funds will be redirected to similar causes with donor notification.</p></section>
      </div>
    </div>
  </Layout>
);

export default DonationPolicy;
