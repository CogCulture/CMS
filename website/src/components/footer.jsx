"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// Dropdown/Accordion Component 
const FooterSection = ({ title, links, isOpen, onToggle }) => {
  return (
    <div data-testid="footer-section" className="mb-8 lg:mb-0">
      <button 
        data-testid="footer-section-toggle" 
        onClick={onToggle}
        className="mb-0 flex w-full items-center lg:mb-6 justify-between"
      >
        <div className="flex w-full items-center justify-between pr-2 lg:pr-8">
          <p className="text-start text-sm font-medium tracking-widest uppercase">{title}</p>

          <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round" 
            className={`lucide lucide-chevron-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </div>
      </button>

      <ul 
        data-testid="footer-section-list" 
        className={`overflow-hidden transition-all duration-250 ease-in-out lg:pt-0 lg:pb-4 space-y-3 ${
          isOpen ? 'max-h-[1500px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0'
        }`}
      >
        {links.map((link, idx) => (
          <li key={idx}>
            <Link
              data-testid="footer-link"
              className="text-xs tracking-widest text-gray-500 uppercase transition-colors hover:text-gray-900"
              href="#"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function Footer() {

  const [openSection, setOpenSection] = useState(null);

  const footerSectionsData = [
    {
      title: "ABOUT EMAAR",
      links: [
        "Who We Are",
        "Leadership",
        "Awards",
        "Emaar Business",
        "Emaar Foundation",
        "Career",
        "Investor Relations",
        "Emaar Blogs",
        "Media",
        "Emaar Sustainability",
        "E-Services",
        "Contact Us",
        "Compliance"
      ]
    },
    {
      title: "PROJECTS",
      links: [
        "Residential",
        "Commercial"
      ]
    },
    {
      title: "MASTER DEVELOPMENTS",
      links: [
        "Gomti Greens",
        "Savana by Indore Greens",
        "Savana by Jaipur Greens"
      ]
    },
    {
      title: "LATEST LAUNCHES",
      links: [
        "Emaar Serenity Hills",
        "Urban Ascent",
        "Elite Oasis",
        "Emaar India Business Centre",
        "Mohali Hills Residential Plots"
      ]
    },
    {
      title: "EMAAR INTERNATIONAL",
      links: [
        "KSA",
        "India",
        "Pakistan",
        "Egypt",
        "Morocco",
        "Turkey"
      ]
    },
    {
      title: "EMAAR HOSPITALITY",
      links: [
        "Lorem ipsum pointer",
        "Lorem ipsum pointer"
      ]
    }
  ];

  const legalLinks = [
    "Privacy Policy",
    "Disclaimer",
    "Terms & Conditions",
    "Country & Language"
  ];

  return (
    <footer
      data-testid="site-footer"
      className="bg-[#fafafa] text-gray-800 mt-13"
    >

      <div className="container mx-auto px-4 2xl:px-24">
        
        {/* Top Section (Logo & Socials) */}
        <div className="mx-auto flex flex-col justify-between gap-4 border-b border-gray-300 py-4 lg:flex-row lg:items-center lg:pb-12 lg:pt-16">

          <div className="flex items-center gap-8">

            <Link
              data-testid="footer-logo-link"
              className="shrink-0"
              href="/en"
            >
              
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 83.161 32.535"
                className='w-24 xl:w-32'
              >
                <g
                  id="emaar-india-logo-en"
                  transform="translate(-0.239 -0.154)"
                >
                  <path
                    id="Path_1"
                    data-name="Path 1"
                    d="M75.528,8.961l.692-.07c2.327-.343,4.308-1.694,4.308-4.2,0-4.752-5.715-4.533-8.137-4.533H68.848a5.471,5.471,0,0,1,.456,2.6V14.083a5.489,5.489,0,0,1-.456,2.6h3.612a5.835,5.835,0,0,1-.462-2.6V9c.346.02.883.133,1.642,1.03A66.652,66.652,0,0,0,80.066,16.7H83.4L75.528,8.961M72,8.175V1.131C77.182.923,77.713,3.5,77.77,4.688a3.208,3.208,0,0,1-1.99,3.266l.008-.007s-.025.009-.075.031a14.527,14.527,0,0,1-3.717.2m-5.8,5.812L59.934.165h-.717l-6.36,14.22a8.754,8.754,0,0,1-1.391,2.3h2.139l2.69-6.05h5.488l2.726,6.05h3.626a7.675,7.675,0,0,1-1.942-2.7h0Zm-9.369-4.5,2.194-4.935,2.237,4.935Zm-7.8,4.5L42.769.165H42.05l-6.358,14.22a8.734,8.734,0,0,1-1.392,2.3h2.141l2.692-6.05h5.487l2.727,6.05h3.626a7.675,7.675,0,0,1-1.942-2.7h0ZM39.66,9.483l2.2-4.935,2.235,4.935H39.66Zm-9.572,7.2a9.7,9.7,0,0,0,.031-2.9L29.068,6,23.34,16.678H22.247L16.42,5.52l-1.131,8.438a11.265,11.265,0,0,0-.057,2.727H13.183a7.026,7.026,0,0,0,.679-2.6L15.714.165h.945l6.8,12.991L30.248.165h.71l1.915,13.892a7.524,7.524,0,0,0,.715,2.628h-3.5ZM12.3,15.039l-.247,1.647H.239a5.48,5.48,0,0,0,.457-2.6V2.766A5.463,5.463,0,0,0,.239.165H11.77l.02,1.677-.549-.235A4.386,4.386,0,0,0,9.708,1.3H3.387V7.77H10.8L10.438,9.04H3.387v6.475h6.688a5.084,5.084,0,0,0,2.246-.619l-.031.142H12.3Z"
                    transform="translate(0 0)"
                  />

                  <g
                    id="Group_2"
                    data-name="Group 2"
                    transform="translate(29.353 25.989)"
                  >
                    <g id="Group_1" data-name="Group 1">

                      <path
                        id="Path_2"
                        data-name="Path 2"
                        d="M.047,1.263,0,0,.214.034A1.508,1.508,0,0,0,.419.049,1.536,1.536,0,0,0,.624.034L.838,0,.791,1.263.769,2.526V4.2L.79,5.472.838,6.7Q.629,6.68.419,6.681L0,6.7.047,5.472.068,4.2V2.526L.047,1.263"
                        fillRule="evenodd"
                      />

                      <path
                        id="Path_3"
                        data-name="Path 3"
                        d="M7.74,4.14,5.554,1.532l-.017.7-.008,1.2,0,.488.008.611.013.648.017.611.017.493.017.286a2.128,2.128,0,0,0-.294-.018A2.376,2.376,0,0,0,5,6.577c.011-.062.023-.178.038-.348l.038-.606.039-.766.034-.827.021-.808.008-.705,0-1.55L5.152,0h.134l1.1,1.33,1.16,1.4L8.635,4.036l.9,1.048V3.806L9.525,1.884,9.471.121a1.069,1.069,0,0,0,.286.047,1.075,1.075,0,0,0,.269-.047L9.988.742l-.042.884-.039.921-.017.724v.564l0,.668.008.7.008.657,0,.531V6.7H9.8L7.74,4.14"
                        transform="translate(-0.812)"
                        fillRule="evenodd"
                      />

                      <path
                        id="Path_4"
                        data-name="Path 4"
                        d="M15.835,4.2l.056,2.068a3.193,3.193,0,0,0,.528.073l.687.024a4.171,4.171,0,0,0,1.02-.127,2.186,2.186,0,0,0,.914-.477A2.551,2.551,0,0,0,19.7,4.8a4.122,4.122,0,0,0,.255-1.575,4.122,4.122,0,0,0-.2-1.4A2.138,2.138,0,0,0,19.208.97a1.91,1.91,0,0,0-.83-.439A4.315,4.315,0,0,0,17.32.409l-.779.029-.649.069-.042.98-.013,1.039V4.2Zm-.76-1.678-.023-1.263L15,0l.7.034.7.014.7-.024L17.8,0a3.867,3.867,0,0,1,1.4.224,2.422,2.422,0,0,1,.951.639,2.546,2.546,0,0,1,.543,1.014,4.929,4.929,0,0,1,.171,1.351,3.784,3.784,0,0,1-.32,1.643,3.125,3.125,0,0,1-.817,1.078,2.988,2.988,0,0,1-1.095.58,4.165,4.165,0,0,1-1.145.17q-.315,0-.621-.01l-.622-.01h-.621L15,6.7l.051-1.229L15.075,4.2Z"
                        transform="translate(-2.437)"
                        fillRule="evenodd"
                      />

                      <path
                        id="Path_5"
                        data-name="Path 5"
                        d="M24.047,1.263,24,0l.214.034a1.546,1.546,0,0,0,.205.014,1.507,1.507,0,0,0,.205-.014L24.838,0l-.047,1.263L24.77,2.526V4.2l.021,1.268L24.838,6.7q-.209-.02-.419-.019L24,6.7l.047-1.229L24.068,4.2V2.526l-.021-1.263"
                        transform="translate(-3.899)"
                        fillRule="evenodd"
                      />

                      <path
                        id="Path_6"
                        data-name="Path 6"
                        d="M29.76,3.724l.5.009.5.01.518-.005.518-.014L30.769,1.292Zm4.1,2.977a1.712,1.712,0,0,0-.245-.019h-.491a1.684,1.684,0,0,0-.245.019l-.176-.531-.245-.651-.274-.689-.259-.665-.6-.014-.611-.005-.565.005-.565.014-.537,1.421L28.686,6.7A3.063,3.063,0,0,0,28,6.7l1.463-3.331L30.9,0h.176l.482,1.2.528,1.307.537,1.312.505,1.21.425,1,.312.671Z"
                        transform="translate(-4.549)"
                        fillRule="evenodd"
                      />

                    </g>
                  </g>
                </g>
              </svg>

            </Link>
            
            <div className="h-8 w-px bg-gray-300 hidden md:block"></div>
            
            <div
              data-testid="footer-social-list"
              className="flex items-center gap-6"
            >
              <a
                data-testid="footer-social-link"
                href="#"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="hover:text-secondary text-[#232323] transition-colors"
                aria-label="facebook"
              >
                <div className="[&_svg]:size-5">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                  </svg>
                </div>
              </a>

              <a
                data-testid="footer-social-link"
                href="#"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="hover:text-secondary text-[#232323] transition-colors"
                aria-label="twitter"
              >
                <div className="[&_svg]:size-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 1024 1024"
                    fill="currentColor"
                  >
                    <path
                      d="M818 800 498.11 333.745l.546.437L787.084 0h-96.385L455.738 272 269.15 0H16.367l298.648 435.31-.036-.037L0 800h96.385l261.222-302.618L565.217 800zM230.96 72.727l448.827 654.546h-76.38L154.217 72.727z"
                      transform="translate(103 112)"
                    ></path>
                  </svg>
                </div>
              </a>

              <a
                data-testid="footer-social-link"
                href="#"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="hover:text-secondary text-[#232323] transition-colors"
                aria-label="youtube"
              >
                <div className="[&_svg]:size-5">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                  </svg>
                </div>
              </a>

              <a
                data-testid="footer-social-link"
                href="#"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="hover:text-secondary text-[#232323] transition-colors"
                aria-label="instagram"
              >
                <div className="[&_svg]:size-5">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636-.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"></path>
                  </svg>
                </div>
              </a>

              <a
                data-testid="footer-social-link"
                href="#"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="hover:text-secondary text-[#232323] transition-colors"
                aria-label="linkedin"
              >
                <div className="[&_svg]:size-5">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Subscribe Form */}
          <div className="flex w-full flex-col gap-2 md:w-auto">
            <form
              data-testid="newsletter-form"
              className="flex w-full items-center md:w-auto"
            >
              <input
                data-testid="newsletter-form-email-input"
                required
                type="email"
                placeholder="Enter email"
                className="xs:text-lg xs:text-sm flex-1 rounded-none bg-white px-3 transition-colors focus:border-gray-500 focus:outline-none md:h-12 md:w-100"
                name="email"
              />

              <button
                data-testid="newsletter-form-submit"
                className="border-primary cursor-pointer text-xs uppercase xs:text-sm rounded-none border-0 bg-neutral-500 px-6 py-2 font-semibold tracking-wider whitespace-nowrap text-white transition-colors hover:bg-neutral-500 hover:text-black md:h-12 md:w-42"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

        </div>

        {/* Middle Section (Grid 4 items in a row) */}
        <div className="flex flex-col">
          <div className="container mx-auto px-0 self-center pt-8 sm:pt-12 sm:pb-2">

            <div className="grid grid-cols-1 gap-0 lg:grid-cols-4 lg:gap-x-8">
              {footerSectionsData.map((section, index) => (
                <FooterSection
                  key={index}
                  title={section.title}
                  links={section.links}
                  isOpen={openSection === index}
                  onToggle={() =>
                    setOpenSection(openSection === index ? null : index)
                  }
                />
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Legal Links */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container px-4 2xl:px-24 mx-auto py-6">

          <ul
            data-testid="footer-legal-list"
            className="flex flex-wrap justify-center text-sm text-gray-700"
          >
            {legalLinks.map((item, idx) => (
              <li key={idx}>
                <Link
                  data-testid="footer-link"
                  className={`px-4 text-xs tracking-widest text-gray-500 uppercase transition-colors hover:text-gray-900 ${
                    idx !== legalLinks.length - 1 ? 'border-e' : ''
                  }`}
                  href="#"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>

        </div>
      </div>

    </footer>
  );
}