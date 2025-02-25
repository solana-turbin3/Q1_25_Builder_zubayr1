"use client";

export default function ApisPage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">1CS API Documentation</h1>
        <p className="text-lg opacity-70">
          API documentation for the One Click Share (1CS) protocol
        </p>
      </div>

      {/* Textify Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold">Textify API</h2>

        {/* Encapsulate Text */}
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <span className="badge badge-success">POST</span>
              <h3 className="card-title">Encapsulate Text</h3>
            </div>
            <p className="opacity-70">
              Create a new text encapsulation with specified permissions
            </p>

            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Program Method</h4>
                <code className="bg-base-300 px-2 py-1 rounded">
                  encapsulate_text
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Parameters</h4>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <code>{`{
  label: string,     // Unique identifier for the encapsulation
  data: string,      // Text content to encapsulate
  creator: PublicKey // Creator's wallet address
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Returns</h4>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <code>{`{
  label: string,
  creator: PublicKey,
  owner: PublicKey,
  data: {
    text: string,
    token: null
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Add Permission */}
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <span className="badge badge-success">POST</span>
              <h3 className="card-title">Add Permission</h3>
            </div>
            <p className="opacity-70">Grant access permissions to a wallet</p>

            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Program Method</h4>
                <code className="bg-base-300 px-2 py-1 rounded">
                  add_permission
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Parameters</h4>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <code>{`{
  label: string,              // Encapsulation label
  roleIndex: number,          // 2: Admin, 3: Full Access, 4: Time Limited
  startTime: number,          // Unix timestamp (for time-limited only)
  endTime: number,            // Unix timestamp (for time-limited only)
  creator: PublicKey,         // Creator's wallet address
  permittedWallet: PublicKey  // Wallet to grant permission to
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Returns</h4>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <code>{`{
  mainDataPda: PublicKey,
  wallet: PublicKey,
  role: {
    owner: boolean,
    admin: boolean,
    fullAccess: boolean,
    timeLimited: boolean
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Data */}
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <span className="badge badge-warning">PUT</span>
              <h3 className="card-title">Edit Text Data</h3>
            </div>
            <p className="opacity-70">
              Modify the content of an existing text encapsulation
            </p>

            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Program Method</h4>
                <code className="bg-base-300 px-2 py-1 rounded">
                  edit_text_data
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Parameters</h4>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <code>{`{
  label: string,      // Encapsulation label
  creator: PublicKey, // Creator's wallet address
  data: string        // New text content
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Returns</h4>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <code>{`{
  label: string,
  creator: PublicKey,
  owner: PublicKey,
  data: {
    text: string,
    token: null
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">API Development in Progress</h3>
            <div className="text-sm">
              The 1CS API is currently under active development. More endpoints
              and features will be added soon. For the latest updates, please
              check our documentation regularly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
