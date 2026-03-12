import { IconType } from "react-icons";
import {
  FaFileAlt,
  FaBox,
  FaShippingFast,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaShieldAlt,
  FaUndoAlt,
} from "react-icons/fa";

export interface SupportCase {
  id: string;
  customerImage: string;
  customerQuote: string;
  resolutionIcon: IconType;
  resolutionAction: string;
  response: string;
}

export const SUPPORT_CASES: SupportCase[] = [
  {
    id: "return-policy",
    customerImage: "/images/benefit-2-customer-1.png",
    customerQuote: '"What\'s your return policy?"',
    resolutionIcon: FaFileAlt,
    resolutionAction: "Policy retrieved",
    response:
      "You've got 30 days to return any item. Happy to help start one.",
  },
  {
    id: "order-tracking",
    customerImage: "/images/benefit-2-customer-2.png",
    customerQuote: '"Where\'s my order?"',
    resolutionIcon: FaBox,
    resolutionAction: "Order tracked",
    response:
      "It shipped yesterday and should arrive Monday. Want the tracking link?",
  },
  {
    id: "shipping-time",
    customerImage: "/images/benefit-2-customer-3.png",
    customerQuote: '"How long does delivery take?"',
    resolutionIcon: FaShippingFast,
    resolutionAction: "Shipping checked",
    response:
      "Usually 2\u20133 business days. I can show faster options too.",
  },
  {
    id: "change-address",
    customerImage: "/images/benefit-2-customer-4.png",
    customerQuote: '"I put the wrong shipping address."',
    resolutionIcon: FaMapMarkerAlt,
    resolutionAction: "Address updated",
    response:
      "No problem \u2014 I can update it before the order ships.",
  },
  {
    id: "cancel-order",
    customerImage: "/images/benefit-2-customer-5.png",
    customerQuote: '"Can I cancel my order?"',
    resolutionIcon: FaTimesCircle,
    resolutionAction: "Order cancelled",
    response:
      "Yes \u2014 it hasn\u2019t been processed yet. I can cancel it now.",
  },
  {
    id: "warranty",
    customerImage: "/images/benefit-2-customer-6.png",
    customerQuote: '"Is there a warranty on this?"',
    resolutionIcon: FaShieldAlt,
    resolutionAction: "Warranty confirmed",
    response:
      "Yes, everything includes a 2-year warranty.",
  },
  {
    id: "start-return",
    customerImage: "/images/benefit-2-customer-7.png",
    customerQuote: '"I want to return this."',
    resolutionIcon: FaUndoAlt,
    resolutionAction: "Return started",
    response:
      "Of course. I can start the return for you.",
  },
];
