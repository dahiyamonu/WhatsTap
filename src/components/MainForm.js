import React, { useState, useEffect } from "react";
import { saveHistory } from "../utils/contactUtils";

const MainForm = ({ setContactHistory, setYourContacts }) => {
  const [countryCode, setCountryCode] = useState("+91");
  const [number, setNumber] = useState("");
  const [validNumber, setValidNumber] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [qrLink, setQrLink] = useState("");
  const [countryCodes, setCountryCodes] = useState([]);

  useEffect(() => {
    // Fetch country codes from an API (REST Countries)
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) => {
        // Map the data to get country names and dial codes
        const countryCodeList = data.map((country) => ({
          name: country.name.common,
          code: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ""),
        }));
        setCountryCodes(countryCodeList);
      })
      .catch((error) => {
        console.error("Error fetching country codes:", error);
      });
  }, []);

  const handleCountryCode = (event) => {
    setCountryCode(event.target.value);
  };

  function now() {
    const now = new Date();
    const formattedString = `Contacted on: ${now.toUTCString()}`;
    return formattedString;
  }

  const validatePhoneNumber = (number) => {
    const phoneRegex =
      /^1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
    return phoneRegex.test(number) && number.length === 10;
  };

  const handleOnChange = (event) => {
    const value = event.target.value;
    const phoneNumber = value.replace(/[^0-9]/g, "");
    setNumber(phoneNumber);
    if (validatePhoneNumber(phoneNumber)) {
      setValidNumber(true);
      setQrLink(
        `https://api.whatsapp.com/send/?phone=${phoneNumber}&text&type=phone_number&app_absent=0`
      );
    } else {
      setValidNumber(false);
      setQrLink("");
    }
  };

  const saveContact = () => {
    let phoneNumber = countryCode + number;
    let savedContacts = localStorage.getItem("savedContacts");
    let savedContactsArray = savedContacts ? JSON.parse(savedContacts) : [];
    let nameExists = savedContactsArray.some(
      (contact) => contact.name === name
    );
    let numberExists = savedContactsArray.some(
      (contact) => contact.number === phoneNumber
    );
    if (nameExists || numberExists) {
      setError(true);
    } else {
      setError(false);
      savedContactsArray.push({
        name: name,
        number: phoneNumber,
      });
      localStorage.setItem("savedContacts", JSON.stringify(savedContactsArray));

      const historyArray = JSON.parse(localStorage.getItem("history"));
      for (let i = 0; i < historyArray.length; i++) {
        let number = historyArray[i].number;
        const found = savedContactsArray.find(
          (contact) => contact.number === number
        );
        if (found) {
          historyArray[i].name = found.name;
        }
      }
      localStorage.setItem("history", JSON.stringify(historyArray));
      setContactHistory(JSON.parse(localStorage.getItem("history")));
    }
    setYourContacts(savedContactsArray);
  };

  return (
    <div className="col-lg-6 py-3">
      <div className="row">
        <div className="col-sm-4">
          <div className="row">
            <div className="col-12">
              <p className="text-dark text-m font-bold">Country</p>
              <select
                onChange={handleCountryCode}
                value={countryCode}
                className="form-control"
              >
                {countryCodes.map((country, index) => (
                  <option key={index} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 d-sm-block d-none">
              {validNumber ? (
                <img
                  className="w-75 p-1 rounded"
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrLink}&size=720x720`}
                  alt="Loading QR"
                />
              ) : (
                <p className="p-2 text-m">
                  Enter valid number to get QR (Scan and Chat)
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="col-sm-8">
          <p className="text-dark text-m font-bold">Phone Number</p>
          <input
            onChange={handleOnChange}
            value={number}
            type="tel"
            className="form-control"
            placeholder="Enter valid number (10 digits)"
          />
          <a
            onClick={() => {
              saveHistory(countryCode + number, now());
              setContactHistory(JSON.parse(localStorage.getItem("history")));
            }}
            rel="noreferrer"
            target="_blank"
            href={`http://wa.me/${countryCode + number}`}
            className={`btn btn-success my-3 m-auto w-100 ${
              validNumber ? "" : "disabled"
            }`}
          >
            <i className="bi bi-whatsapp" /> Chat on whatsapp
          </a>
          <input
            onChange={(event) => {
              setName(event.target.value);
            }}
            value={name}
            type="text"
            className="form-control"
            placeholder="Enter name to save contact on browser"
          />
          <button
            onClick={saveContact}
            className={`btn btn-success w-100 my-3 ${
              validNumber && name ? "" : "disabled"
            }`}
          >
            Save Contact
          </button>
          {error && (
            <p className="text-danger">
              Error: The name or number already exists
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainForm;
