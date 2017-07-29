var FullContact         = require('fullcontact');
var fullcontact         = new FullContact('8001d10ba87b6206');
var EarlyAccesModel     = require('./earlyaccess.model.js');
var request             = require('request');


exports.earlyAccess = function(req, res){
    console.log('\n\n----->', req.body)
    fullcontact.person.email(req.body.email, function (err, data) {
        if(err){
            var ObjKlenty       = new Object();
            ObjKlenty.Email     = req.body.email;
            ObjKlenty.Name      = ObjKlenty.Email.split('@')[0];
        }
        else{
            var ObjKlenty = convertFCData(data);
            ObjKlenty.Email = req.body.email;
            ObjKlenty.Name = data.contactInfo.fullName || data.contactInfo.givenName || ObjKlenty.Email.split('@')[0];
        }
        ObjKlenty.FirstName = ObjKlenty.Name.split(' ')[0];
        ObjKlenty.LastName = ObjKlenty.Name.split(' ')[1];

        saveData(ObjKlenty, data)

        addProspectInKlenty(ObjKlenty)

    });

    res.json({status: true})
}


var saveData = function (ObjKlenty, fcData) {
    var data = new EarlyAccesModel({
        Name    : ObjKlenty.Name,
        Email   : ObjKlenty.Email,
        Company : ObjKlenty.Company,
        FC      : fcData
    });
    data.save();
}


var addProspectInKlenty = function (ObjKlenty) {
    var options     = new Object();
    options.url     = 'https://app.klenty.com/apis/v1/user/gokul@saasgrids.com/prospects/prospect';
    options.headers  = {
        'x-api-key' : '597CF1D5BC0AF90B00D7EC9F'
    }
    options.form    = ObjKlenty;
    options.method  = 'POST';

    request(options, function(req, res, body) {
        console.log(res.status, body)
    })
}



var convertFCData	= function (data) {
	// populate prospectdetails
	var objFCProfile				= new Object();
	// get organization Details
	var objOrganizationDetails		= getOrganizationDetails(data);
	// finding twitter and linkedin profiles
	var objSocialProfiles			= getSocialProfiles(data);

	if(objOrganizationDetails){
		objFCProfile.Title				= objOrganizationDetails.pTitle;
		objFCProfile.Company			= objOrganizationDetails.pCompany;
	}

	//get profile picture
	objFCProfile.img_url     		= getProfilePic(data);
	//finding location
	objFCProfile.Location			= getLocation(data);
	if(objSocialProfiles){
		objFCProfile.LinkedinProfileURL= stripUrl(objSocialProfiles.pLinkedinProfileURL);
		objFCProfile.Twitter			= objSocialProfiles.pTwitter;
	}

	return objFCProfile;

}
/**
 * gets profile pic url from fullcontact data
 * @param {Object} data fullcontact api call results
 */

var getProfilePic	= function (data) {
	var prof_pic      = (data.photos && data.photos.length > 0) ? data.photos[0].url : "";
	return prof_pic;
}

var getLocation	 = function (data) {
	var pLocation     = (data.demographics  && data.demographics.locationGeneral) ?
												data.demographics.locationGeneral :
												 "";
	return pLocation;
}

var getSocialProfiles = function (data) {
	var pLinkedinProfileURL		= "";
	var pTwitter				= "";
	// no of social profiles for selecting if not matched
	var socialProfilesCount		= 0;

	var objResult				= new Object();
	//finding twitter profile
	if (data.socialProfiles  &&  data.socialProfiles.length > 0) {
		//setting no of socialProfiles
		socialProfilesCount  = data.socialProfiles.length;
		data.socialProfiles.some(function (profile) {
			if (profile.type ==  'twitter') {
				pTwitter    = profile.username ? profile.username : "";
				return true; //loop breaks here
			} //type==twitter
		});// looping social profiles

		data.socialProfiles.some(function (profile) {
			if (profile.type ==  'linkedin') {
				pLinkedinProfileURL    = profile.url;
				return true; //loop breaks here
			} //type==linkedin

		});// looping social profiles
	} // if data.socialProfiles

	objResult.pLinkedinProfileURL	= pLinkedinProfileURL;
	objResult.pTwitter				= pTwitter;
	objResult.socialProfilesCount	= socialProfilesCount;
	return objResult;
}


/**
 * gets Organization Details fullcontact data
 * @param {Object} data fullcontact api call results
 */

var getOrganizationDetails	= function (data) {
	// flags in organizations 1:- current : is current organization, 2:- isprimary :it is the primary organization
	//getting title also checking isprimary, current flag
	var pTitle      				= "";
	var pCompany    				= "";
	var objOrganizationDetails		= new Object();

	if (data.organizations   &&  data.organizations.length > 0) {
		// if both current and isPrimary flags exist
		data.organizations.some(function (organization) {
			if (organization.current   &&  organization.current == true  &&  organization.isPrimary
				&&  organization.isPrimary == true) {

				pTitle      = organization.title ? organization.title : "";
				pCompany      = organization.name ? organization.name : "";
				return true;     //break the loop here
			}
		});
		// if only current flag exists
		if (pTitle == ""   &&  pCompany == "") {
			data.organizations.some(function (organization) {
				if(organization.current   &&  organization.current == true) {
					pTitle      = organization.title ? organization.title : "";
					pCompany      = organization.name ? organization.name : "";
					return true;     //break the loop here
				}
			});
		} //pTitle==""
		// if only isPrimary exists
		if (pTitle == ""   &&  pCompany == "") {
			data.organizations.some(function (organization) {
				if (organization.isPrimary   &&  organization.isPrimary == true) {
					pTitle      = organization.title ? organization.title : "";
					pCompany      = organization.name ? organization.name : "";
					return true;     //break the loop here
				}
			});
		} //pTitle==""
		// if none of them exists first value is taken
		if (pTitle == ""   &&  pCompany == "") {
			pTitle      = data.organizations[0].title ? data.organizations[0].title : "";
			pCompany      = data.organizations[0].name ? data.organizations[0].name : "";
		} //pTitle==""
	} //  if data.organizations
	objOrganizationDetails.pTitle	= pTitle;
	objOrganizationDetails.pCompany	= pCompany;

	return objOrganizationDetails;
}

var stripUrl = function (strUrl) {
	return strUrl.replace(/http:\/\/www.|https:\/\/www.|http:\/\/|https:\/\//g, '');
}
