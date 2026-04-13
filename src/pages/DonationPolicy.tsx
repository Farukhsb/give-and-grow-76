import Layout from "@/components/Layout";

const DonationPolicy = () => (
  <Layout>
    <div className="container py-16">
      <h1 className="font-serif text-4xl font-bold">Donation Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 13, 2026</p>
      <div className="mt-8 max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">How Donations Are Processed</h2><p>One-time donations are initiated through Stripe Checkout. A donation is recorded as pending when checkout starts and is only marked as completed after a server-side Stripe webhook verifies the payment.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Tax Receipts</h2><p>Tax documentation should only be issued for verified completed donations. The app stores the verified payment state after the Stripe webhook confirms the transaction.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Recurring Donations</h2><p>Recurring donations are not yet enabled. They will remain unavailable until subscription billing and customer self-service management are implemented and tested.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Refund Policy</h2><p>Completed donations are generally non-refundable unless required by law or in the case of unauthorized transactions. Refund handling should be managed through the connected payment processor and internal support workflow.</p></section>
        <section><h2 className="mb-2 font-serif text-xl font-semibold text-foreground">Charity Verification</h2><p>All charities on CharityApp are verified nonprofits. We conduct regular audits to ensure funds are used appropriately. If a charity is removed from our platform, any remaining funds will be redirected to similar causes with donor notification.</p></section>
      </div>
    </div>
  </Layout>
);

export default DonationPolicy;
