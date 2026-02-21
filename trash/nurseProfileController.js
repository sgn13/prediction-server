// const { default: mongoose } = require("mongoose");
const NurseProfileModal = require("../models/nurseProfileModal");
const UserModal = require("../models/userModal");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopNurseProfiles = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price";
  req.query.fields = "name,price";
  next();
};

exports.createNurseProfile = async (req, res, next) => {
  try {
    const user_id = req.user; // Extract user_id from decoded token

    const profileData = {
      ...req.body,
      user_id,
    };

    const nurseProfile = new NurseProfileModal(profileData);

    const savedNurseProfile = await nurseProfile.save();

    res.status(201).json({ data: savedNurseProfile, message: "Nurse profile created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNurseProfiles = async (req, res, next) => {
  try {
    const query = NurseProfileModal.find();

    // Apply genre filtering if a genre is provided
    // if (genre) {
    //   query.where("genre_id").in([genre]); // Filter by genre (array support)
    // }

    const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();

    const nurseProfiles = await features.query.populate("user_id");

    res.status(200).json({ data: nurseProfiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNurseProfile = async (req, res, next) => {
  try {
    const userId = req.user;
    const nurseProfile = await NurseProfileModal.find({ user_id: userId });
    res.status(200).json({ data: nurseProfile[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNurseProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const nurseProfile = await NurseProfileModal.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    });

    if (!nurseProfile) {
      return res.status(404).json({ message: "Nurse profile not found" });
    }

    res.status(200).json({ message: "Nurse profile updated", data: nurseProfile });
    // const { id } = req.params;
    // const { name, nurseProfile_url, color, users } = req.body;

    // if (!name) {
    //   return res.status(400).json({ msg: "Please enter all the fields" });
    // }
    // req.body.created_by = req.user

    // const nurseProfile = await NurseProfileModal.findOne({ _id: id });

    // if (!nurseProfile) {
    //   next(`No nurseProfile found with this ID ${id}`);
    // }

    // if(!req.user.user_id ===nurseProfile.created_by.toString()){
    //   next(`You're not authorize to delete this nurseProfile`)
    //   return
    // }

    // Perform the update
    // const updateNurseProfile = await NurseProfileModal.findOneAndUpdate({ _id: id }, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // res.status(200).json({ total: updateNurseProfile?.length, data: updateNurseProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNurseProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const nurseProfile = await NurseProfileModal.findOne({ _id: id });

    if (!nurseProfile) {
      next(`No nurseProfile found with this ID ${id}`);
    }

    if (!req.user.user_id === nurseProfile.created_by.toString()) {
      next(`You're not authorize to delete this nurseProfile`);
      return;
    }

    await nurseProfile.deleteOne();

    res.status(200).json({ message: "NurseProfile deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.applyToNurseProfile = async (req, res) => {
  try {
    const { nurseProfileId } = req.params;
    const nurseId = req.user; // assuming you're using auth middleware

    // Optional: check if the user is a nurse
    const user = await UserModal.findById(nurseId);
    if (!user || !user.is_nurse) {
      return res.status(403).json({ message: "Only nurses can apply to nurseProfiles" });
    }

    // Update nurseProfile with the applicant
    const result = await NurseProfileModal.findByIdAndUpdate(nurseProfileId, {
      $addToSet: { applicants: nurseId }, // avoids duplicates
    });

    return res.status(200).json({ message: "Applied successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
