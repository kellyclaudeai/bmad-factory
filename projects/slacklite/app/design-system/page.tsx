"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.length > 0 && value.length < 3) {
      setInputError("Input must be at least 3 characters");
    } else {
      setInputError("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          SlackLite Design System
        </h1>

        {/* Colors Section */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Colors</h2>
          
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-medium text-gray-800">Brand Colors</h3>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-lg bg-primary-brand" />
                <span className="mt-2 text-sm">Primary Brand</span>
                <span className="text-xs text-gray-600">#4A154B</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-lg bg-primary-light" />
                <span className="mt-2 text-sm">Primary Light</span>
                <span className="text-xs text-gray-600">#611F69</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-lg bg-primary-dark" />
                <span className="mt-2 text-sm">Primary Dark</span>
                <span className="text-xs text-gray-600">#350D36</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-lg font-medium text-gray-800">Semantic Colors</h3>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-lg bg-success" />
                <span className="mt-2 text-sm">Success</span>
                <span className="text-xs text-gray-600">#2EB67D</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-lg bg-error" />
                <span className="mt-2 text-sm">Error</span>
                <span className="text-xs text-gray-600">#E01E5A</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-lg bg-warning" />
                <span className="mt-2 text-sm">Warning</span>
                <span className="text-xs text-gray-600">#ECB22E</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-lg bg-info" />
                <span className="mt-2 text-sm">Info</span>
                <span className="text-xs text-gray-600">#36C5F0</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-medium text-gray-800">Gray Scale</h3>
            <div className="flex gap-2">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-900" />
                <span className="mt-1 text-xs">900</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-800" />
                <span className="mt-1 text-xs">800</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-700" />
                <span className="mt-1 text-xs">700</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-600" />
                <span className="mt-1 text-xs">600</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-500 border border-gray-400" />
                <span className="mt-1 text-xs">500</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-400 border border-gray-400" />
                <span className="mt-1 text-xs">400</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-300 border border-gray-400" />
                <span className="mt-1 text-xs">300</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-200 border border-gray-400" />
                <span className="mt-1 text-xs">200</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-400" />
                <span className="mt-1 text-xs">100</span>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Typography</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-normal">Heading 3XL - 32px Normal</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">Heading 2XL - 24px Semibold</p>
            </div>
            <div>
              <p className="text-xl font-medium">Heading XL - 20px Medium</p>
            </div>
            <div>
              <p className="text-lg font-normal">Text LG - 16px Normal</p>
            </div>
            <div>
              <p className="text-base font-normal">Text Base - 14px Normal</p>
            </div>
            <div>
              <p className="text-sm font-normal">Text SM - 13px Normal</p>
            </div>
            <div>
              <p className="text-xs font-normal">Text XS - 12px Normal</p>
            </div>
          </div>
        </section>

        {/* Button Component */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Button</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Input Component */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Input</h2>
          
          <div className="max-w-md space-y-6">
            <Input
              id="input-basic"
              label="Basic Input"
              placeholder="Enter text..."
            />

            <Input
              id="input-with-value"
              label="Input with Value"
              defaultValue="Some text"
            />

            <Input
              id="input-with-helper"
              label="Input with Helper Text"
              placeholder="Enter your email"
              helperText="We'll never share your email with anyone else"
            />

            <Input
              id="input-error"
              label="Input with Error"
              value={inputValue}
              onChange={handleInputChange}
              error={inputError}
              placeholder="Type at least 3 characters"
            />

            <Input
              id="input-disabled"
              label="Disabled Input"
              placeholder="Cannot edit"
              disabled
            />
          </div>
        </section>

        {/* Modal Component */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Modal</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              Click the button below to open a modal. The modal includes:
            </p>
            <ul className="list-inside list-disc text-gray-700">
              <li>Overlay with click-to-close</li>
              <li>ESC key to close</li>
              <li>Focus trap (Tab cycles through focusable elements)</li>
              <li>Accessible ARIA attributes</li>
            </ul>
            
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
            size="md"
          >
            <div className="space-y-4">
              <p>
                This is a modal dialog. You can close it by clicking the X button,
                pressing ESC, or clicking outside the modal.
              </p>
              <p>
                Try pressing Tab to cycle through the focusable elements. The focus
                will stay trapped within the modal.
              </p>
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Badge Component */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Badge</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">Variants</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="default">3</Badge>
                <Badge variant="success">✓</Badge>
                <Badge variant="error">!</Badge>
                <Badge variant="warning">⚠</Badge>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Badge size="sm">5</Badge>
                <Badge size="md">12</Badge>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">Usage Example</h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-900"># general</span>
                <Badge>3</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Avatar Component */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Avatar</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar alt="John Doe" size="sm" fallbackText="John Doe" />
                <Avatar alt="Jane Smith" size="md" fallbackText="Jane Smith" />
                <Avatar alt="Bob Johnson" size="lg" fallbackText="Bob Johnson" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">With Initials</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar alt="Sarah Wilson" fallbackText="Sarah Wilson" />
                <Avatar alt="Alex Brown" fallbackText="Alex Brown" />
                <Avatar alt="Maria Garcia" fallbackText="Maria Garcia" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">Single Name</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar alt="Admin" fallbackText="Admin" />
                <Avatar alt="User" fallbackText="User" />
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Notes */}
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            Accessibility (WCAG 2.1 AA)
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Color Contrast Ratios</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>White on Primary Brand: 14.00:1 (AAA) ✓</li>
                <li>White on Error: 4.66:1 (AA) ✓</li>
                <li>Gray 900 on White: 16.99:1 (AAA) ✓</li>
                <li>Gray 700 on White: 6.26:1 (AAA) ✓</li>
                <li>All text combinations meet WCAG AA minimum (4.5:1)</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">Keyboard Navigation</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Tab: Navigate between interactive elements</li>
                <li>Enter/Space: Activate buttons</li>
                <li>ESC: Close modals</li>
                <li>Focus indicators: 2px ring on all interactive elements</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-800">ARIA Labels</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Inputs: Proper label associations and error states</li>
                <li>Modals: role=&ldquo;dialog&rdquo;, aria-modal, aria-labelledby</li>
                <li>Buttons: Descriptive labels for icon-only buttons</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
