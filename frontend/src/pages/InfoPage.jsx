import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const pages = {
  about: {
    title: "About",
    lead: "LocalConnect is a marketplace for work that happens near you. You describe the problem, a local model names the kind of help you need, and you hire a provider inside the radius you choose.",
    actions: [
      { label: "Find a pro", to: "/" },
      { label: "Create an account", to: "/register" },
    ],
    sections: [
      {
        heading: "What the product does",
        paragraphs: [
          "A customer writes what is broken, what they want done, and how soon. LocalConnect reads that description, suggests a category such as plumbing, cleaning, or tutoring, and lists active services whose providers are inside the selected distance.",
          "The home search uses 10, 25, 50, or 100 kilometers. The API accepts any radius from 1 to 200 kilometers. Signed-in customers are matched from the location saved on their account. Guests are matched from the location the browser reports.",
        ],
      },
      {
        heading: "How a job moves",
        steps: [
          { title: "Request", text: "A customer opens a listing and sends a note of 8 to 1,000 characters. The request starts as open, and the amount is the listing price." },
          { title: "Accept", text: "The provider accepts or rejects. A customer can cancel while the request is still open or accepted." },
          { title: "Lock", text: "After acceptance, the customer locks the price from their wallet. The provider is not paid yet." },
          { title: "Release", text: "When the work is finished, the customer confirms completion and the locked amount moves to the provider." },
        ],
      },
      {
        heading: "Who uses it",
        cards: [
          { title: "Customers", text: "People who need a local service and want the price held until they confirm the job." },
          { title: "Pros", text: "Providers who publish a service in their city and respond to requests sent to that listing." },
          { title: "Accounts", text: "Customer and provider accounts are created from the public signup pages." },
        ],
      },
    ],
  },
  partner: {
    title: "Partner with us",
    lead: "Cities, schools, property teams, and local businesses can bring trusted providers onto LocalConnect so residents can book them the same way they book any other pro.",
    actions: [{ label: "Sign up as a pro", to: "/signup/provider" }],
    sections: [
      {
        heading: "What a partner listing includes",
        paragraphs: [
          "Every provider on LocalConnect has a name, a city, a country, and coordinates. Each service has a title, a category, a description, a whole-number price, a currency, and a location. Inactive services stay hidden from search.",
        ],
        points: [
          "A trade group can ask its members to publish under one category, such as Plumbing or Electrical.",
          "A property manager can point residents to services whose providers sit inside a short radius of the building.",
          "A school or community center can list tutoring and baby care providers who already work in that neighborhood.",
        ],
      },
      {
        heading: "How to start",
        paragraphs: [
          "There is no separate partner contract in the product. An organization starts by creating a provider account for each pro, or by having each pro register themselves. The account stores the detected region, and new services are priced in the currency for that country.",
          "Customers then find those listings from the home search or from Services. A request goes to the provider who owns the listing, and payment stays in escrow until the customer releases it.",
        ],
      },
    ],
  },
  developers: {
    title: "For developers",
    lead: "The LocalConnect API is JSON over HTTP. In local development it runs on port 5000, and the web app calls it through /api.",
    sections: [
      {
        heading: "Shape of a response",
        paragraphs: [
          "Successful responses use { success: true } and put the record in data. Failures use { success: false, message }. Validation errors can also include an errors array. Protected routes expect Authorization: Bearer followed by the JWT returned at login or registration. Tokens last 7 days.",
        ],
      },
      {
        heading: "Accounts",
        endpoints: [
          { method: "POST", path: "/api/auth/register", text: "Create a CUSTOMER or PROVIDER. Send name, email, password, role, and the detected location, city, country, country code, latitude, and longitude. Phone is optional." },
          { method: "POST", path: "/api/auth/login", text: "Exchange email and password for a token and the public user." },
          { method: "GET", path: "/api/auth/me", text: "Return the signed-in user. Password hashes are never included." },
        ],
      },
      {
        heading: "Discovery and services",
        endpoints: [
          { method: "POST", path: "/api/discover", text: "Send problem (8–1000 characters), radiusKm (1–200), latitude, and longitude. A signed-in caller is matched from the account location. The body comes back with the analysis and nearby services." },
          { method: "GET", path: "/api/geo/reverse", text: "Turn latitude and longitude into a city, country, and country code." },
          { method: "GET", path: "/api/services", text: "List active services. Query parameters q, location, and category narrow the list." },
          { method: "GET", path: "/api/services/:id", text: "Read one service and its provider." },
          { method: "POST", path: "/api/services", text: "Provider only. Create a listing with title, description, category, price, and location." },
          { method: "GET", path: "/api/health", text: "Check that the API process is up." },
        ],
      },
      {
        heading: "Requests and escrow",
        endpoints: [
          { method: "POST", path: "/api/requests", text: "Customer only. Body is serviceId and note. Amount and currency are copied from the listing." },
          { method: "GET", path: "/api/requests", text: "List the signed-in customer’s or provider’s requests." },
          { method: "POST", path: "/api/requests/:id/accept", text: "Provider. OPEN becomes ACCEPTED." },
          { method: "POST", path: "/api/requests/:id/reject", text: "Provider. OPEN becomes REJECTED." },
          { method: "POST", path: "/api/requests/:id/cancel", text: "Customer. Allowed while the request is OPEN or ACCEPTED." },
          { method: "POST", path: "/api/requests/:id/fund", text: "Customer. Moves the price from the wallet into escrow and sets the request to FUNDED." },
          { method: "POST", path: "/api/requests/:id/release", text: "Customer. Pays the provider and sets escrow and the request to RELEASED." },
          { method: "GET", path: "/api/wallet", text: "List wallet balances for the signed-in user." },
          { method: "POST", path: "/api/wallet/topup", text: "Add test funds. Body is a whole-number amount from 1 to 10000000 and a 3-letter currency. This is not a card charge." },
        ],
      },
    ],
  },
  careers: {
    title: "Careers",
    lead: "LocalConnect does not have open jobs. This page describes the work the product depends on, so the list is here when roles exist.",
    sections: [
      {
        heading: "Work the product needs",
        cards: [
          { title: "Matching", text: "Turn a plain-language problem into a category, then rank active providers by distance." },
          { title: "Marketplace", text: "Keep listings, requests, and escrow states consistent from open through release." },
          { title: "Trust", text: "Protect accounts, keep location data limited to matching, and make payment steps obvious." },
          { title: "Local operations", text: "Help providers write clear prices and help customers describe a job in one note." },
        ],
      },
      {
        heading: "How hiring will work",
        paragraphs: [
          "There is no application form and no recruiting inbox on this site. When a role opens, it will be listed on this page with the city or remote expectation and the part of the product it covers.",
        ],
      },
    ],
  },
  press: {
    title: "Press",
    lead: "Facts about LocalConnect for anyone writing about the product. There is no press kit download and no scheduled announcement list.",
    sections: [
      {
        heading: "Product facts",
        points: [
          "LocalConnect matches a written problem to a service category and to providers inside a chosen radius.",
          "Categories in the catalog include cleaning, handyman work, plumbing, electrical, painting, tutoring, baby care, and mechanics.",
          "A request stores the customer, the provider, the service, a note, the listing price, and a status.",
          "Payment is a wallet balance. Locking a job moves that balance into escrow. Releasing it pays the provider. Adding funds is a test top-up, not a card charge.",
          "Accounts are customers, providers, or admins. Passwords are hashed. The API returns a public user without the password.",
        ],
      },
      {
        heading: "What to cite",
        paragraphs: [
          "Describe LocalConnect as a local services marketplace with escrow. The customer confirms completion before the provider is paid. Quotes about unreleased features, native apps, or a review score would be inaccurate: listings currently show that there are no reviews yet, and the product is a web app.",
        ],
      },
    ],
  },
  blog: {
    title: "Blog",
    lead: "Short notes on how matching, payment, and listings work in the product you are using.",
    sections: [
      {
        posts: [
          {
            title: "A sentence is enough to start a match",
            date: "November 10, 2026",
            text: "The home search asks for at least 8 characters and at most 1,000. A useful description names the object, the fault, and the place: “The kitchen sink drains slowly and the cabinet under it is damp.” The model returns a category and an urgency, and the matcher keeps providers inside the radius. Vague wording still runs, but a specific sentence gives you a tighter category.",
          },
          {
            title: "The price on the listing is the price that locks",
            date: "November 4, 2026",
            text: "When a customer sends a request, the amount and currency are copied from the service. There is no second quote inside the request. If the job is larger than the starting price, the provider should say so in a message before accepting, and the customer should wait for an updated listing price. Once the request is funded, that amount is what moves to the provider on release.",
          },
          {
            title: "Cancel before you lock the payment",
            date: "October 28, 2026",
            text: "A customer can cancel an open or accepted request. After the wallet is debited and escrow is held, that cancel action is refused. The next customer action on a funded job is to confirm completion, which releases the payment. Read the note and the price on the request page before you lock funds.",
          },
        ],
      },
    ],
  },
  "how-to": {
    title: "How to use LocalConnect",
    lead: "Five steps from a description on the home page to a released payment.",
    actions: [
      { label: "Start a search", to: "/" },
      { label: "Sign up", to: "/register" },
    ],
    sections: [
      {
        steps: [
          { title: "Describe the problem", text: "On the home page, write at least a short sentence, confirm the city, and pick 10, 25, 50, or 100 km. Submit the form. You will see the suggested category, the urgency, and services inside that radius." },
          { title: "Open a listing", text: "Each card shows the provider, the distance, and the starting price in the listing currency. Open one to read the description before you hire." },
          { title: "Send a request", text: "Sign in as a customer. On the service page, describe the job in 8 to 1,000 characters and send it. The request appears under Requests with status open." },
          { title: "Wait for a yes, then lock the price", text: "The provider accepts or rejects. After an acceptance, add test funds to your wallet in the same currency if the balance is short, then lock the payment. The provider still is not paid." },
          { title: "Release when the work is done", text: "Confirm completion on the request. The escrow status becomes released and the amount is added to the provider’s wallet. If you change your mind before locking, cancel from the request page." },
        ],
      },
      {
        heading: "If you are browsing without an account",
        paragraphs: [
          "Search and service pages are public. Sending a request, funding it, and releasing it require a customer account. The account stores your region so later searches use that point instead of asking the browser again.",
        ],
      },
    ],
  },
  app: {
    title: "Get the app",
    lead: "LocalConnect is a web app. You can keep it on your phone’s home screen. There is no separate download in an app store.",
    sections: [
      {
        heading: "iPhone",
        steps: [
          { title: "Open the site in Safari", text: "Use Safari. Other iPhone browsers do not offer the same home-screen action." },
          { title: "Share, then Add to Home Screen", text: "Tap the share button, choose Add to Home Screen, and confirm the name LocalConnect." },
          { title: "Open it like an app", text: "The icon opens the same site. Sign in once. The session token lasts 7 days." },
        ],
      },
      {
        heading: "Android",
        steps: [
          { title: "Open the site in Chrome", text: "Chrome is the browser that offers an install prompt for this site." },
          { title: "Install or add to the home screen", text: "Use the menu and choose Install app or Add to Home screen." },
          { title: "Use the same account", text: "Customer and provider accounts work in the installed icon. Requests and wallet balances stay on the server." },
        ],
      },
      {
        paragraphs: [
          "Pros use the same site. The provider home screen shortcut is described on the iPhone and Android pages for pros.",
        ],
      },
    ],
  },
  "cost-estimates": {
    title: "Cost estimates",
    lead: "The price you see on a listing is the amount that will be locked if you hire that pro. LocalConnect does not add a second estimate after you send the request.",
    actions: [{ label: "Browse services", to: "/services" }],
    sections: [
      {
        heading: "What the number means",
        paragraphs: [
          "Providers set a whole-number starting price and a 3-letter currency. Search results and the service page show that price. A new request copies it. Your wallet must hold at least that amount in the same currency before you can lock payment.",
          "Adding money uses a test top-up on the account wallet. It is not a charge to a bank card. The lock still behaves like escrow: the amount leaves your balance, sits as held, and reaches the provider only when you confirm the job.",
        ],
      },
      {
        heading: "What can change the price",
        points: [
          "A provider can edit the listing. Requests already sent keep the amount they were created with.",
          "Hidden services cannot be requested, so an old price on an inactive listing cannot be booked.",
          "Currency follows the listing. A wallet in another currency does not pay that job.",
          "There is no platform fee line item in the request. The locked amount and the released amount are the same number.",
        ],
      },
      {
        heading: "How to read a result",
        paragraphs: [
          "On the home page, compare prices only among services in the same category and a similar distance. A lower price is the provider’s starting rate, not a bid against the other cards. If the job is larger than that rate, ask the provider to update the listing before you send the request.",
        ],
      },
    ],
  },
  resources: {
    title: "Home resource center",
    lead: "Use this page to decide what to write, which category fits, and when to lock payment.",
    sections: [
      {
        heading: "Write a description that matches",
        paragraphs: [
          "Name the room or object, what is wrong, and any limit on time or access. “Outlet in the hallway sparks when the lamp is plugged in” is a better electrical match than “something is wrong at home.” Stay inside 1,000 characters. The search form requires 8.",
        ],
        cards: [
          { title: "Cleaning", text: "Rooms, type of clean, and whether supplies are already in the home." },
          { title: "Handyman", text: "The fixture, the tool access, and whether the repair is one item or a list." },
          { title: "Plumbing", text: "Which fixture, whether water is still on, and any leak under a cabinet or ceiling." },
          { title: "Electrical", text: "Which circuit or device, and whether the breaker has already tripped." },
          { title: "Painting", text: "Interior or exterior, approximate area, and whether the wall is repaired." },
          { title: "Tutoring", text: "Subject, level, and whether the session is at home." },
          { title: "Baby care", text: "Ages, hours, and the neighborhood where care is needed." },
          { title: "Mechanics", text: "Vehicle type, the symptom, and whether it still drives." },
        ],
      },
      {
        heading: "Before you lock funds",
        points: [
          "Read the service description and the starting price.",
          "Put the same details in the request note so the provider can accept or reject with the facts.",
          "Check the wallet currency. The top-up currency has to match the listing.",
          "Cancel while the request is open or accepted if the scope changed. After funding, cancel is no longer available.",
        ],
      },
    ],
  },
  "for-pros": {
    title: "LocalConnect for pros",
    lead: "A provider account lets you publish services in your city and accept requests from customers who found you by distance.",
    actions: [{ label: "Sign up as a pro", to: "/signup/provider" }],
    sections: [
      {
        heading: "Set up",
        steps: [
          { title: "Register as a provider", text: "Choose the pro account. The form stores your name, email, password, optional phone, and the region detected from your browser." },
          { title: "Publish a service", text: "From Your services, add a title, description, category, and whole-number price. The currency follows your country. The listing location is the region on your account." },
          { title: "Stay inside search", text: "Active listings appear when a customer’s problem matches your category and you are inside their radius. An inactive listing is hidden." },
        ],
      },
      {
        heading: "A request on your side",
        paragraphs: [
          "Open requests are yours to accept or reject. Accepting does not pay you. The customer locks the price next. After they confirm the work, the same amount is added to your wallet in that currency.",
          "You only see requests sent to you. You cannot request your own service, and you cannot fund or release a job. Those actions belong to the customer.",
        ],
      },
    ],
  },
  community: {
    title: "Community",
    lead: "Providers on LocalConnect work from their own listings. There is no public forum. The shared part of the product is the request each customer sends to one pro.",
    sections: [
      {
        heading: "How pros share the marketplace",
        paragraphs: [
          "Search shows every active service in range, with the provider’s name, distance, and price. Customers choose one listing. That choice creates a private request between that customer and that provider. Other pros do not see the note.",
        ],
        points: [
          "Keep the title specific so you are not matched for work you do not do.",
          "Use the description for the jobs you will accept at the listed price.",
          "Reject a request when the note is outside that scope. The customer can hire a different listing.",
          "Release happens only after the customer confirms, so the status on the request is the record of the job.",
        ],
      },
      {
        heading: "What is not here yet",
        paragraphs: [
          "Listings show “No reviews yet.” There is no message board, no referral program, and no public profile beyond the service and the provider fields returned with it.",
        ],
      },
    ],
  },
  "pro-resources": {
    title: "Pro resources",
    lead: "A short guide to a listing that customers can understand and a request you can accept with confidence.",
    actions: [{ label: "Create a provider account", to: "/signup/provider" }],
    sections: [
      {
        heading: "Listing checklist",
        points: [
          "Title: the job, not a slogan. “Drain unclog for a kitchen sink” is clearer than “Best plumber in town.” Titles can be 120 characters.",
          "Category: one of the catalog names customers already search, such as Plumbing, Cleaning, or Tutoring.",
          "Description: what is included at the starting price, and what is not. The limit is 2,000 characters.",
          "Price: a whole number greater than 0 in your country’s currency. That number is what the customer locks.",
          "Location: taken from the region on your account. Customers only see you inside the radius they picked.",
        ],
      },
      {
        heading: "Responding",
        paragraphs: [
          "Read the note before you accept. If the job is larger than the listing, update the price first and ask the customer to send a new request. Accepting locks you to the amount already stored on that request.",
          "Reject requests you will not do. An open request stays open until you respond or the customer cancels.",
        ],
      },
    ],
  },
  "pro-reviews": {
    title: "Pro reviews",
    lead: "Every listing currently shows “No reviews yet.” A review count is reserved for work a customer actually finished.",
    sections: [
      {
        heading: "What customers see",
        paragraphs: [
          "Service cards on the home page and the results list do not show a star score. They show the provider, the distance, the price, and the line “No reviews yet.” That is intentional. The matcher records a review count of zero because a review is not stored on a service today.",
        ],
      },
      {
        heading: "What a review should be tied to",
        paragraphs: [
          "A useful review belongs to one released request: the customer hired the pro, locked the price, and confirmed completion. Open, rejected, cancelled, and merely accepted jobs are not finished work. When reviews are added, they should follow that released request so a person who never hired the pro cannot post one.",
        ],
        points: [
          "Describe the job that was booked, not a general opinion of the trade.",
          "Mention whether the work matched the listing description.",
          "Keep payment comments tied to the escrow step you confirmed.",
        ],
      },
    ],
  },
  "pro-iphone": {
    title: "iPhone app for pros",
    lead: "Pros use LocalConnect in Safari. A separate iPhone app is not available.",
    actions: [{ label: "Sign up as a pro", to: "/signup/provider" }],
    sections: [
      {
        steps: [
          { title: "Register in Safari", text: "Open the site, choose Sign up as a pro, and allow location so your city and coordinates are saved. New services use that region." },
          { title: "Add the icon", text: "Tap Share, then Add to Home Screen. The icon opens the same provider account." },
          { title: "Work from Requests", text: "Accept or reject open requests from the request list. Your wallet updates when a customer releases a funded job." },
        ],
      },
      {
        paragraphs: [
          "Push notifications are not part of the site. Check Requests when you are available to respond. An open request stays open until you accept, you reject, or the customer cancels.",
        ],
      },
    ],
  },
  "pro-android": {
    title: "Android app for pros",
    lead: "Pros use LocalConnect in Chrome. A separate Android app is not available.",
    actions: [{ label: "Sign up as a pro", to: "/signup/provider" }],
    sections: [
      {
        steps: [
          { title: "Register in Chrome", text: "Create a provider account and allow location. The city stored on the account is the city customers measure distance from." },
          { title: "Add the icon", text: "Open the Chrome menu and choose Install app or Add to Home screen." },
          { title: "Publish, then respond", text: "Add a service from Your services. When a request arrives, accept it only if the note fits the price already on the listing." },
        ],
      },
      {
        paragraphs: [
          "The installed icon is the website. Wallet balances, listings, and requests are loaded from the API when you are signed in.",
        ],
      },
    ],
  },
  help: {
    title: "Help",
    lead: "Fixes for the problems people hit while searching, signing in, and paying.",
    sections: [
      {
        heading: "Search and location",
        points: [
          "The home form needs a location before it can match. If the city stays on “Locating,” allow location in the browser and submit again.",
          "A signed-in search uses the latitude and longitude saved at registration, even if you have traveled.",
          "Descriptions shorter than 8 characters are rejected. The upper limit is 1,000 characters.",
          "An empty result means no active service in that category sits inside the radius. Widen the radius or browse Services.",
        ],
      },
      {
        heading: "Accounts",
        points: [
          "Passwords must be 6 to 72 characters. Emails are stored in lowercase.",
          "Registration needs a detected region, city, country, and country code. If location fails, the account cannot be created.",
          "Customer and provider are chosen at sign-up. A provider uses Your services. A customer uses Account and Requests.",
          "The sign-in token lasts 7 days. If a protected page sends you to log in, sign in again.",
        ],
      },
      {
        heading: "Requests and wallet",
        points: [
          "Only a customer can send, cancel, fund, or release a request.",
          "Only the provider on that request can accept or reject, and only while it is open.",
          "Funding fails when the wallet balance in that currency is below the listing price. Top up in the same 3-letter currency. The top-up is test funds, not a card payment.",
          "Cancel works for open and accepted requests. A funded request cannot be cancelled from the cancel action.",
          "You can open only your own requests. Someone else’s link returns an error.",
        ],
      },
      {
        heading: "If pages fail to load data",
        paragraphs: [
          "The web app talks to the API through /api. If lists stay empty and the browser reports a network error, the API process on port 5000 needs to be running, and the database URL in the backend environment needs to be valid. The health check is GET /api/health.",
        ],
      },
    ],
  },
  safety: {
    title: "Safety",
    lead: "Hire through a request, and pay by locking the listing price. The provider is paid when you confirm the job, not when you send the note.",
    sections: [
      {
        heading: "Payment",
        points: [
          "Do not send the service price outside LocalConnect before the job is complete.",
          "Lock funds only after the provider has accepted and the note still describes the job you want.",
          "A test top-up adds balance inside the app. It does not move money from a bank.",
          "After the payment is locked, the cancel action is unavailable. Confirm the scope before you fund.",
        ],
      },
      {
        heading: "The job itself",
        points: [
          "Keep the address and access details in the request note so they stay on the record between you and that provider.",
          "Meet in a shared or public part of the property when the work allows it.",
          "For electrical, gas, or structural risk, stop using the damaged fixture until a qualified provider has accepted the job.",
          "Reject the request, or cancel it before funding, if the conversation no longer matches the listing.",
        ],
      },
      {
        heading: "Your account",
        paragraphs: [
          "The API never returns your password. Do not share the login token. Sign out on a shared computer. Location is stored so matching stays near the region you registered with.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    lead: "These terms cover use of the LocalConnect web app and API: accounts, listings, requests, and the wallet used to lock a price.",
    sections: [
      {
        heading: "Accounts",
        paragraphs: [
          "You must provide a real name, a valid email, a password of 6 to 72 characters, and a detected region. The role is customer or provider. Admin accounts are not created from the public registration form.",
          "You are responsible for activity under your token. Passwords are stored as hashes. You may not request your own service.",
        ],
      },
      {
        heading: "Listings",
        paragraphs: [
          "Providers publish services they intend to perform at the stated price in the stated area. Titles, descriptions, categories, and prices must describe the work. Inactive services are not offered. LocalConnect may hide a listing by marking it inactive.",
        ],
      },
      {
        heading: "Requests",
        paragraphs: [
          "A customer request includes a note and the price copied from the listing. The provider may accept or reject while the request is open. The customer may cancel while it is open or accepted. Funding is allowed only after acceptance and only if the customer’s wallet covers the amount in that currency. Release is the customer’s confirmation that the job is done, and it pays the provider.",
          "Wallet top-ups in this version are test funds. They are not a charge to a payment card and they are not a stored-value account at a bank.",
        ],
      },
      {
        heading: "Acceptable use",
        points: [
          "Use the product to request and offer real local services.",
          "Do not send requests for work you do not intend to book.",
          "Do not attempt to read another person’s requests, wallet, or account.",
          "Do not rely on the test wallet as a way to move real money.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    lead: "LocalConnect stores the account and location details needed to match you with a nearby provider, and the request details needed to hold a price until the job is done.",
    sections: [
      {
        heading: "Information you provide",
        points: [
          "Name, email, and a hashed password.",
          "Role: customer, provider, or admin.",
          "Optional phone number.",
          "Location label, city, country, country code, latitude, and longitude.",
          "Service listings you publish: title, description, category, price, currency, and location.",
          "Request notes, amounts, currencies, statuses, and escrow records.",
          "Wallet balances by currency.",
        ],
      },
      {
        heading: "How it is used",
        paragraphs: [
          "Location is used to measure distance and to choose a currency for new provider listings. The problem text you submit for discovery is sent to the local matching model so it can return a category and urgency. Request notes are shown to the customer and the provider on that request.",
          "Passwords are hashed and are not returned by the API. Public user objects omit the password field. A request can be read by its customer and its provider, not by other accounts.",
        ],
      },
      {
        heading: "What we do not do",
        paragraphs: [
          "LocalConnect does not sell personal information and does not share it for cross-context advertising. There is no advertising profile and no sale of location history.",
        ],
      },
      {
        heading: "How long it stays",
        paragraphs: [
          "Account, service, request, escrow, and wallet rows stay in the database until they are deleted. Deleting an account is limited by the records still attached to it in the database.",
        ],
      },
    ],
  },
  patents: {
    title: "Patents",
    lead: "LocalConnect does not claim any patents.",
    sections: [
      {
        paragraphs: [
          "The matching flow, the service listings, the request statuses, and the escrow wallet are part of this web application. They are not offered under a patent license, and this page is not a notice that any method is patented.",
          "If that changes, this page will list the patent numbers and the product features they cover. Until then, there is nothing to look up.",
        ],
      },
    ],
  },
  "ca-notice": {
    title: "CA Notice at Collection",
    lead: "This notice describes the personal information LocalConnect collects when you register, search, publish a service, or send a request. It is written for California residents and matches what the product stores for everyone.",
    sections: [
      {
        heading: "Categories collected",
        points: [
          "Identifiers: name, email, account id, and optional phone.",
          "Account credentials: a password, stored only as a hash.",
          "Location: city, country, country code, a location label, latitude, and longitude.",
          "Commercial information: services you list, requests you send or receive, prices, currencies, and wallet balances.",
          "Customer content: the problem text used for matching and the note on a request.",
        ],
      },
      {
        heading: "Why it is collected",
        paragraphs: [
          "Identifiers and credentials create and protect the account. Location limits search results to providers near that point and sets the currency on a new listing. Request and wallet records run the escrow steps: open, accepted, funded, and released. Problem text is used to suggest a category.",
          "LocalConnect does not sell this information and does not share it for cross-context behavioral advertising. See Do not sell or share my personal information.",
        ],
      },
      {
        heading: "Retention",
        paragraphs: [
          "The data stays in the application database for as long as the account, listing, request, or wallet row exists.",
        ],
      },
    ],
  },
  "do-not-sell": {
    title: "Do not sell or share my personal information",
    lead: "LocalConnect does not sell personal information and does not share it for cross-context behavioral advertising. No opt-out is required, because that sale or share does not happen.",
    sections: [
      {
        heading: "What the product does with personal information",
        paragraphs: [
          "Name, email, phone, and location stay on your account so you can sign in and so search can measure distance. Request notes stay on the request so the customer and the provider can read them. Wallet balances stay on your wallet so a price can be locked and released.",
        ],
      },
      {
        heading: "What it does not do",
        points: [
          "It does not sell personal information for money or other valuable consideration.",
          "It does not share personal information with advertisers for cross-context behavioral advertising.",
          "It does not build an advertising profile from your searches or requests.",
        ],
      },
      {
        paragraphs: [
          "Because there is no sale and no share of that kind, there is no preference switch to store. If a future version adds either practice, this page will describe it and offer a way to opt out before that processing starts. The Privacy Policy lists the fields the app stores today.",
        ],
      },
    ],
  },
};

function Method({ children }) {
  return (
    <span className="inline-flex rounded-full bg-sky px-2 py-0.5 text-xs font-bold tracking-wide text-leaf-dark">
      {children}
    </span>
  );
}

export default function InfoPage() {
  const { slug } = useParams();
  const page = pages[slug];

  useEffect(() => {
    document.title = page ? `${page.title} · LocalConnect` : "Page not found · LocalConnect";
    return () => {
      document.title = "LocalConnect | Find local pros";
    };
  }, [page]);

  if (!page) {
    return (
      <div className="page-enter mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-extrabold">Page not found</h1>
        <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-leaf">Back home</Link>
      </div>
    );
  }

  return (
    <article className="page-enter">
      <header className="border-b border-line bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-leaf">LocalConnect</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{page.title}</h1>
          <p className="mt-4 text-lg leading-8 text-muted">{page.lead}</p>
          {page.actions?.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {page.actions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-dark"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-12">
        {page.sections.map((section, index) => (
          <section key={section.heading || `section-${index}`} className={index === 0 ? "" : "mt-12"}>
            {section.heading ? <h2 className="text-2xl font-extrabold tracking-tight">{section.heading}</h2> : null}
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-base leading-7 text-muted">{paragraph}</p>
            ))}
            {section.steps ? (
              <ol className="mt-6 space-y-4">
                {section.steps.map((step, stepIndex) => (
                  <li key={step.title} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky text-sm font-extrabold text-leaf-dark">
                      {stepIndex + 1}
                    </span>
                    <div>
                      <p className="font-bold">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
            {section.points ? (
              <ul className="mt-4 space-y-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.cards ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {section.cards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-line bg-cream/60 p-5">
                    <p className="font-bold">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{card.text}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {section.posts ? (
              <div className="space-y-6">
                {section.posts.map((post) => (
                  <article key={post.title} className="rounded-2xl border border-line p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf">{post.date}</p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{post.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-muted">{post.text}</p>
                  </article>
                ))}
              </div>
            ) : null}
            {section.endpoints ? (
              <ul className="mt-4 space-y-3">
                {section.endpoints.map((endpoint) => (
                  <li key={`${endpoint.method} ${endpoint.path}`} className="rounded-2xl border border-line p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Method>{endpoint.method}</Method>
                      <code className="text-sm font-semibold">{endpoint.path}</code>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{endpoint.text}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
