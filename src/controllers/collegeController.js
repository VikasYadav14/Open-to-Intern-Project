const collegeModel = require("../models/collegeModel");
const internModel = require("../models/internModel");
const { isValid, isValidUrl, isValidName,isValidCollegeName } = require("../validations/validation");

const createColleges = async function (req, res) {
    try {
        let { name, fullName, logoLink, isDeleted } = req.body;
        
        if (Object.entries(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Data should be provided" })
        }
        if (isValid(name) == false) {
            return res.status(400).send({ status: false, message: "Abbreviation is required" });
        }
        if (isValidName.test(name) == false) {
            return res.status(400).send({ status: false, message: "Only alphabets are allowed in name" })
        }
        name = name.toLowerCase();
        if (isValid(fullName) == false) {
            return res.status(400).send({ status: false, message: "College name is required" });
        }
        if (!isValidCollegeName(fullName)) {
            return res.status(400).send({ status: false, message: "Only alphabets are allowed in college name" })
        }
        if (isValid(logoLink) == false) {
            return res.status(400).send({ status: false, message: "Logo link is required" });
        }
        if (isValidUrl(logoLink) == false) {
            return res.status(400).send({ status: false, msg: "URL is wrong" });
        }

        const duplicate = await collegeModel.findOne({ name: name });
        if (duplicate) {
            return res.status(400).send({ status: false, message: "The college is already present" });
        }
        req.body.name = name;

        const colleges = await collegeModel.create(req.body)
        let collegeData = {};
        collegeData.name = colleges.name,collegeData.fullName = colleges.fullName
        collegeData.logoLink = colleges.logoLink,collegeData.isDeleted = colleges.isDeleted
        return res.status(201).send({ status: true, data: collegeData });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getCollegeDetails = async function (req, res) {
    try {
        const obj = {}
        let collegeName = req.query.collegeName
        if (isValid(collegeName)==false) return res.status(400).send({ status: false, message: "Please enter college Name in Abbreviation" })
        collegeName = collegeName.toLowerCase().trim()

        const collegeID = await collegeModel.findOne({ name: collegeName }).select({ _id: 1 })
        if (!collegeID) return res.status(404).send({ status: false, message: "College Not Found" })

        let internData = await internModel.find({ collegeId: collegeID, isDeleted: false }).select({ _id: 1, name: 1, email: 1, mobile: 1 })
        if(internData.length==0){
            internData = "There is no such intern in this college"
        }
        const getData = await collegeModel.findOne({ name: collegeName })

        obj.name = getData.name
        obj.fullName = getData.fullName
        obj.logoLink = getData.logoLink
        obj.interns = internData
        res.status(200).send({ status: true, data: obj })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = {createColleges,getCollegeDetails};