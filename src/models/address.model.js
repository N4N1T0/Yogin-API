import mongoose from "mongoose";

const AddressSchema = mongoose.Schema({
  location: {
    type: String,
    required: true,
    unique: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    unique: true,
  },
});

// Método estático para buscar o crear una dirección
AddressSchema.statics.findOrCreate = async function (addressData) {
  // Busca una dirección existente
  let existingAddress = await this.findOne({
    location: addressData.location,
    coordinates: addressData.coordinates,
  });

  // Si ya existe, devuélvela
  if (existingAddress) {
    return existingAddress;
  }

  // Si no existe, crea una nueva
  return this.create(addressData);
};

export const Address = mongoose.model("Address", AddressSchema);
