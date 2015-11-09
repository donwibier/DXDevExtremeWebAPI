using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace WebAPIServer.Models
{
    [XmlRoot(ElementName ="response")]
    [Serializable]
    public class FilmImport
    {       
        static readonly XmlSerializer serializer = new XmlSerializer(typeof(FilmImport), new Type[] { typeof(FilmImportRow) });
        public static FilmImport Create(Stream stream)
        {
            FilmImport result = (serializer.Deserialize(stream) as FilmImport);            
            return result;
        }

        public static FilmImport Create(string xmlFile)
        {
            if (!File.Exists(xmlFile))
            {
                throw new ArgumentException(String.Format("Xml File '{0}' does not exist!", xmlFile));
            }
            using (FileStream fs = File.OpenRead(xmlFile))
            {
                return Create(fs);

            }
        }


        public static FilmImport CreateFromResource(string resourceName)
        {
            var assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            {
                return Create(stream);
            }
        }

        private List<FilmImportRow> _Rows;
        [XmlArray(ElementName ="row")]
        [XmlArrayItem(ElementName ="row")]
        public List<FilmImportRow> Rows
        {
            get
            {
                if (_Rows == null)
                    _Rows = new List<FilmImportRow>();
                return _Rows;
            }
            set { _Rows = value; }
        }
    }
    

    [Serializable]
    public class FilmImportRow
    {
        public string title { get; set; }
        public string release_year { get; set; }
        public string locations { get; set; }
        public string production_company { get; set; }
        public string distributor { get; set; }
        public string director { get; set; }
        public string writer { get; set; }
        public string fun_facts { get; set; }
        public string actor_1 { get; set; }
        public string actor_2 { get; set; }
        public string actor_3 { get; set; }
    }
}
