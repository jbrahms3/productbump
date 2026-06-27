import SubmitForm from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Submit your product</h1>
        <p className="mt-2 text-gray-500">
          List your product and connect Stripe to verify real subscriber growth.
          Your subscriber count updates automatically as new customers sign up.
        </p>
      </div>
      <div className="card p-6">
        <SubmitForm />
      </div>
    </div>
  );
}
