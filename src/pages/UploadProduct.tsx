import { useState } from "react";
import Header from "../components/Header";

const categories = ["Stationery", "Gift Sets", "Paper", "Chitrayan"];

const UploadProduct = () => {
  const [productData, setProductData] = useState<any>({
    title: "",
    category: categories[0],
    description: "",
    price: "",
    discountedPrice: "",
    stockLeft: "",
    image: "", // preview image
  });

  const handleChange = (field: string, value: any) => {
    setProductData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("New Product Data:", productData);
    alert("New product uploaded (dummy)!");
  };

  return (
    <>
      <Header />
      <section className="bg-[#f6f4ef] w-screen min-h-screen py-10 px-6 font-serif flex justify-center items-center">
        <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-[#5C4033] mb-8 text-center">
            Upload New Product
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side: Form Fields */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={productData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter product title"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5C4033] focus:border-[#5C4033]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={productData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5C4033] focus:border-[#5C4033]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={productData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5C4033] focus:border-[#5C4033]"
                ></textarea>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    value={productData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5C4033] focus:border-[#5C4033]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    value={productData.discountedPrice}
                    onChange={(e) =>
                      handleChange("discountedPrice", e.target.value)
                    }
                    placeholder="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5C4033] focus:border-[#5C4033]"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock Left
                </label>
                <input
                  type="number"
                  value={productData.stockLeft}
                  onChange={(e) => handleChange("stockLeft", e.target.value)}
                  placeholder="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5C4033] focus:border-[#5C4033]"
                />
              </div>
            </div>

            {/* Right Side: Image & Save */}
            <div className="flex flex-col items-center justify-center">
              {/* Clickable Image Placeholder */}
              <label htmlFor="imageUpload" className="cursor-pointer">
                {productData.image ? (
                  <img
                    src={productData.image}
                    alt="Preview"
                    className="w-64 h-64 object-cover rounded-lg border mb-4 transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg border mb-4 text-gray-400">
                    Click to Upload Image
                  </div>
                )}
              </label>

              {/* Hidden File Input */}
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const previewURL = URL.createObjectURL(file);
                    setProductData({
                      ...productData,
                      image: previewURL,
                    });
                  }
                }}
              />

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="bg-[#5C4033] text-black px-6 py-2 rounded hover:bg-[#3d2a20] transition-colors"
              >
                Upload Product
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UploadProduct;
